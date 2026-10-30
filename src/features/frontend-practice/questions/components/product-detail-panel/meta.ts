import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "product-detail-panel",
  title: "Build the product detail panel with gallery, stepper and tabs",
  topic: "components",
  difficulty: "medium",
  kind: "build",
  minutes: 35,
  summary: "Image gallery, price block, quantity stepper, add to cart and an accessible tabs widget.",
  scenario:
    "The product page needs its main section rebuilt as one reusable component. Design wants a gallery with thumbnails, the usual name / rating / price block, a quantity stepper that respects stock, an Add to cart button, and a tabbed area (Description, Details, Reviews) below.\n\n" +
    "Implement ProductDetailPanel in src/components/ProductDetailPanel.jsx. The Demo has four sample products (with and without discount, low stock, sold out, missing description) and the Target UI tab shows the finished panel. Match it, then run the tests.",
  inspiredBy: ["client/src/pages/ProductPage.tsx", "client/src/components/ProductCard.tsx"],
  editableFiles: ["src/components/ProductDetailPanel.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "Props: product (the shared product shape), images (array of image URLs; fall back to [product.image] when empty), reviews (array of { _id, name, rating, comment }, default []), onAdd(product, quantity).",
    "Gallery: a group labelled \"Product images\" holds one button per image labelled \"Show image N of M\" (thumbnail <img> with alt=\"\"). The selected button has aria-pressed=\"true\", the first one initially. A main <img> whose alt is the product name shows the selected image's src; the thumbnails never have the product name as alt.",
    "Info block: an <h1> with the product name; the rating line as \"4.7 (212 reviews)\" (\"1 review\" when reviewCount is 1); the price as \"$3.50\". When discount > 0 also show the original price inside an <s> element (\"$4.40\") and a badge \"20% OFF\"; show neither when discount is 0.",
    "Quantity: a group labelled \"Quantity selector\" with buttons \"Decrease quantity\" and \"Increase quantity\" around an element with role=\"status\" and aria-label \"Quantity\" whose text is the number (starts at 1). Decrease is disabled at 1, Increase is disabled at stock. When stock is 1–5 show \"Only N left\".",
    "Add to cart: a button \"Add to cart\" calls onAdd(product, quantity) exactly once, shows \"Added N × <name> to cart\" in an element with role=\"status\" and aria-label \"Cart message\", and resets the quantity to 1. At stock 0 the button reads \"Out of stock\", is disabled together with both stepper buttons, and onAdd can never fire.",
    "Tabs (ARIA tabs pattern): a tablist labelled \"Product information\" with tabs \"Description\", \"Details\" and \"Reviews (N)\" (N = reviews.length). The selected tab has aria-selected=\"true\" and tabindex 0, the others tabindex -1. Exactly one tabpanel is rendered and it is labelled by its tab. ArrowRight / ArrowLeft move the selection (wrapping) and Home / End jump to the first / last tab.",
    "Panels: Description shows product.description or \"No description available.\" when it is null. Details is a <dl> with Unit, Category (the category's display name from the categories fixture), Organic (Yes / No) and Availability (\"40 in stock\" or \"Out of stock\"). Reviews lists each review (name, \"Rated 5 out of 5\", comment) or says \"No reviews yet\".",
    "When the product prop changes to a different product, the selected image, the quantity, the cart message and the selected tab all reset.",
  ],
  expectedBehavior: [
    "Selecting a thumbnail swaps the main image and moves aria-pressed.",
    "The stepper can never go below 1 or above the available stock, and everything is disabled for a sold out product.",
    "Add to cart reports the chosen quantity to the parent, confirms it, and starts over at 1.",
    "The tabs behave like a real ARIA tabs widget, including the keyboard.",
  ],
  reproSteps: [
    "Press Run and look at the Demo: the panel is only a stub.",
    "Open the Target UI tab to see the finished panel for the same product.",
    "Use the Demo's product buttons (Bananas, Milk, Avocados, Olive oil) to check discount, low stock, sold out and a missing description while you build.",
  ],
  acceptanceCriteria: [
    "Gallery thumbnails swap the main image and expose aria-pressed.",
    "Price block shows the original price in <s> and the discount badge only for discounted products.",
    "Stepper respects 1..stock; Add to cart calls onAdd(product, quantity) once, confirms, and resets to 1.",
    "Sold out products show \"Out of stock\" and cannot be added.",
    "Tabs follow the ARIA tabs pattern with arrow / Home / End navigation and one tabpanel at a time.",
    "Switching to another product resets the panel's local state.",
  ],
  edgeCases: [
    "stock of 1 (both stepper buttons disabled), 3 (low stock text) and 0 (sold out)",
    "description is null",
    "a single image or no images array",
    "reviewCount of 1 (singular)",
    "ArrowLeft on the first tab wraps to the last one",
  ],
  hints: [
    "Local state is enough: the selected image index, quantity, tab and message. Everything else is derived from the product prop during render.",
    "To reset state when the product changes, the simplest trick is to key the inner component by product._id instead of syncing state with an effect.",
    "For the tabs, give every tab and panel an id built with useId(), link them with aria-labelledby / aria-controls, and use roving tabindex (0 for the selected tab, -1 for the others).",
    "Moving the selection with the arrow keys should also move focus to the new tab (look it up by id and call .focus()).",
  ],
  explanation: {
    rootCause:
      "This is a build exercise, so there is no bug to find. The traps are state that should be derived (not copied), local state that must reset when the product changes, and the ARIA tabs pattern, which needs the roving tabindex and keyboard handling to be a real tabs widget.",
    fix: "Split the work: a thin wrapper that keys the real panel by product id, derived flags (soldOut, low stock, gallery fallback) computed during render, a stepper with min and max derived from stock, and a tabs widget with ids from useId, aria-selected, roving tabindex and a keydown handler that moves the selection and focus.",
    takeaways: [
      "Reset child state with a key, not with an effect that mirrors props.",
      "Derive booleans from props during render instead of storing them.",
      "ARIA tabs need roles, ids, roving tabindex and arrow-key handling together.",
    ],
  },
  expectedFailures: ["gallery", "stepper", "add to cart", "tabs", "out of stock"],
});
