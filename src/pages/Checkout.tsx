import { ArrowLeft, Check, MapPin, MapPinIcon, Plus, Wallet2Icon } from "lucide-react"
import { useState } from "react"
import useCartStore from "../store/useCartStore";
import type { Address, CartState } from "../types";
import useUserStore from "../store/useUserStore";
import { useNavigate } from "react-router";

const Checkout = () => {


  const [currentStep, setCurrentStep] = useState(1);  

  const steps = [
    {
      id: 1,
      name: "Address",
      icon: <MapPin size={18}/>
    },  
    {
      id: 2,
      name: "Payment",
      icon:<Wallet2Icon size={18}/>
    },
    {
      id: 3,
      name: "Review",
      icon:<Check size={18}/>
    },
  ]
  return(

  <>
    <div className="max-w-7xl mx-auto mt-7 p-6 flex flex-col gap-6">
      <div className="flex flex-row gap-2 text-gray-600 hover:text-app-green transition-colors cursor-pointer">
        <ArrowLeft size={20} />
        <p className="text-sm">Back</p>
      </div>
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="flex flex-row gap-4">
        {/** 3 steps - {adress, payment, review} */}
        {
          steps.map((it) => (

            <div key={it.id} className={`flex flex-row justify-between items-center gap-2 rounded-2xl px-3 py-2 hover:cursor-pointer ${currentStep === it.id ? "bg-app-green text-white" : "bg-white text-gray-600"}`}
            onClick={() => setCurrentStep(it.id)} >
              {it.icon}
              <p className="text-sm">{it.name}</p>
            </div>
          ))
        }
      </div>

      {currentStep === 1 && <DeliveryAdress/>}
      {currentStep === 2 && <Payment/>}
      {currentStep === 3 && <Review/>}

      <OrderSummary/>

    </div>
  </>
  ) 
}

const AddressCard = ({
  address,
}: {address:Address}) => {
  const default_tab = () => {
    return (
      <span className="bg-app-green/10 text-app-green border border-app-green/20 p-1 rounded-full flex flex-row gap-1 items-center w-fit text-xs px-3 font-medium">
        <Check size={14} className="text-app-green" /> Default
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow transition-shadow">
      <div className="flex flex-row gap-3 items-start ">
        <div>
          <MapPinIcon
            className="text-app-green bg-app-cream p-1.5 rounded-lg"
            size={36}
          />
        </div>
        <div className="flex flex-col justify-start">
          <div className="text-lg font-semibold flex flex-row gap-2 items-center">
            <span>{address.label}</span>
            {address.isDefault ? (
              default_tab()
            ) : (
              <button
                className="text-[10px] text-gray-500 hover:text-app-green transition-colors border border-gray-200 hover:border-app-green/30 px-2 py-0.5 rounded-full"
              >
                Set as Default
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{address.address}</p>
          <p className="text-sm text-gray-600">
            {address.city}, {address.state}, {address.zip}
          </p>
        </div>
        
      </div>
    </div>
  );
};



const DeliveryAdress = ()=>{

  const navigate = useNavigate();

  const addresses = useUserStore().addresses;

  return (
    <div className="flex flex-col gap-4 max-w-xl p-4 bg-white rounded-lg">
      <h1 className="text-sm font-semibold">Delivery Address</h1>
      <div className="flex flex-row gap-2 justify-end"
      onClick={() => navigate("/addresses")}>
        <button className="bg-app-green text-white p-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus size={18} />
          <span>Add New Address</span>
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {addresses.map((address) => (
          <AddressCard key={address._id} address={address} />
        ))}
      </div>
    </div>
  )
}

const OrderSummary = ()=>{

    const cart:CartState = useCartStore();
    const {total_items,total_price} = cart;


  return (
    <div className="flex flex-col gap-4 max-w-xl p-4 bg-white rounded-lg">
      <h1 className="text-sm font-semibold">Order Summary</h1>
      <div className="flex flex-row justify-between items-center">
        <p className="text-sm text-gray-600">Subtotal {`(${total_items} items)`}</p>
        <p className="text-sm text-gray-600">$ {total_price}</p>
      </div>
      <div className="flex flex-row justify-between items-center">
        <p className="text-sm text-gray-600">Delivery</p>
        <p className="text-sm text-gray-600">{total_price > 50 ? <span className="text-green-600">Free</span> : "$2"}</p>
      </div>
      <div className="flex flex-row justify-between items-center">
        <p className="text-sm text-gray-600">Tax (18%)</p>
        <p className="text-sm text-gray-600">$ {total_price * 0.18}</p>
      </div>
      <div className="flex flex-row justify-between items-center border-t border-gray-200 pt-4">
        <p className="text-lg   font-semibold">Total</p>
        <p className="text-lg font-semibold">$ {total_price + (total_price > 50 ? 0 : 2) + (total_price * 0.18)}</p>
      </div>
    </div>
  )
}

export default Checkout