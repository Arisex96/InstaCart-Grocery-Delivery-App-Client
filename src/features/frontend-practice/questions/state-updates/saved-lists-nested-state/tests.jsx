import { renderHook, act } from "@testing-library/react";
import useSavedLists from "./src/hooks/useSavedLists";
import { products } from "./src/data/products";

const [bananas, milk, , , , , , , chocolate] = products; // stock 40, 3, ..., 5; prices 1.2, 3.5, 2.7

const makeLists = () => [
  { id: "weekly", name: "Weekly shop", items: [{ product: bananas, quantity: 1 }, { product: milk, quantity: 2 }] },
  { id: "party", name: "Party", items: [{ product: milk, quantity: 1 }, { product: chocolate, quantity: 2 }] },
];
const deepFreeze = (value) => {
  Object.values(value).forEach((v) => v && typeof v === "object" && deepFreeze(v));
  return Object.freeze(value);
};
const setup = (lists = makeLists()) => renderHook(() => useSavedLists(lists));
const qtyOf = (result, listId, productId) =>
  result.current.lists.find((l) => l.id === listId).items.find((i) => i.product._id === productId)?.quantity;

describe("useSavedLists", () => {
  it("changes only the targeted item quantity", () => {
    const { result } = setup();
    act(() => result.current.setQuantity("weekly", "p1", 5));
    expect(qtyOf(result, "weekly", "p1")).toBe(5);
    expect(qtyOf(result, "weekly", "p2")).toBe(2);
    expect(qtyOf(result, "party", "p2")).toBe(1);
  });

  it("clamps to stock and removes the item at quantity 0", () => {
    const { result } = setup();
    act(() => result.current.setQuantity("weekly", "p2", 10));
    expect(qtyOf(result, "weekly", "p2")).toBe(3);
    act(() => result.current.setQuantity("weekly", "p2", 0));
    expect(result.current.lists[0].items.map((i) => i.product._id)).toEqual(["p1"]);
  });

  it("ignores unknown lists and products", () => {
    const { result } = setup();
    const before = result.current.lists;
    act(() => result.current.setQuantity("nope", "p1", 3));
    act(() => result.current.setQuantity("weekly", "zzz", 3));
    expect(result.current.lists).toEqual(before);
  });

  it("does not mutate the data it was given (deep-frozen input)", () => {
    const frozen = deepFreeze(makeLists());
    const { result } = setup(frozen);
    act(() => result.current.setQuantity("weekly", "p1", 4));
    act(() => result.current.moveItem("weekly", "party", "p2"));
    act(() => result.current.removeItem("party", "p9"));
    expect(frozen[0].items[0].quantity).toBe(1);
    expect(qtyOf(result, "weekly", "p1")).toBe(4);
  });

  it("returns new references along the changed path and keeps the rest", () => {
    const { result } = setup();
    const before = result.current.lists;
    act(() => result.current.setQuantity("weekly", "p1", 4));
    const after = result.current.lists;
    expect(after).not.toBe(before);
    expect(after[0]).not.toBe(before[0]); // changed list
    expect(after[0].items[0]).not.toBe(before[0].items[0]); // changed item
    expect(after[0].items[1]).toBe(before[0].items[1]); // untouched item
    expect(after[1]).toBe(before[1]); // untouched list
  });

  it("moves an item and merges quantities with an existing one, clamped to stock", () => {
    const { result } = setup();
    act(() => result.current.moveItem("weekly", "party", "p2")); // milk 2 + 1 = 3 (stock 3)
    expect(qtyOf(result, "weekly", "p2")).toBeUndefined();
    expect(qtyOf(result, "party", "p2")).toBe(3);
    act(() => result.current.moveItem("weekly", "party", "p1")); // bananas: not in party yet
    expect(qtyOf(result, "party", "p1")).toBe(1);
    act(() => result.current.moveItem("party", "party", "p1")); // same list: no-op
    expect(qtyOf(result, "party", "p1")).toBe(1);
  });

  it("derives listTotal from the current items after every kind of change", () => {
    const { result } = setup();
    expect(result.current.listTotal("weekly")).toBeCloseTo(1.2 + 2 * 3.5);
    expect(result.current.listTotal("party")).toBeCloseTo(3.5 + 2 * 2.7);

    act(() => result.current.moveItem("weekly", "party", "p2"));
    expect(result.current.listTotal("weekly")).toBeCloseTo(1.2);
    expect(result.current.listTotal("party")).toBeCloseTo(3 * 3.5 + 2 * 2.7);

    act(() => result.current.setQuantity("party", "p9", 5));
    expect(result.current.listTotal("party")).toBeCloseTo(3 * 3.5 + 5 * 2.7);
    expect(result.current.listTotal("unknown")).toBe(0);
  });

  it("renames a list (trimmed) and ignores empty names", () => {
    const { result } = setup();
    act(() => result.current.renameList("weekly", "  Groceries  "));
    expect(result.current.lists[0].name).toBe("Groceries");
    act(() => result.current.renameList("weekly", "   "));
    expect(result.current.lists[0].name).toBe("Groceries");
  });
});
