import { useContext, useActionState } from "react";
import Modal from "./UI/Modal.jsx";
import CartContext from "../store/CartContext.jsx";
import { currencyFormatter } from "../util/formatting.js";
import Input from "./UI/Input.jsx";
import Button from "./UI/Button.jsx";
import UserProgressContext from "../store/UserProgressContext.jsx";
import useHttp from "../hooks/useHttp.js";
import Error from './Error.jsx';
import { API_URL } from "../config/api.js";

const requestConfig = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

export default function Checkout() {
  const cartCtx = useContext(CartContext);

  const userProgressCtx = useContext(UserProgressContext);

  const {
    data,
    error,
    sendRequest,
    clearData
  } = useHttp(`${API_URL}/orders`, requestConfig);

  const cartTotal = cartCtx.items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );

  function handleClose() {
    userProgressCtx.hideCheckOut();
  }

  function handleFinish(){
    userProgressCtx.hideCheckOut();
    cartCtx.clearCart();
    clearData();
  };

  async function checkoutAction(prevState, fd) {
  
    const customerData = Object.fromEntries(fd.entries());

    await sendRequest(
      JSON.stringify({
        order: {
          items: cartCtx.items,
          customer: customerData,
        },
      })
    );
  }

  const [formState, formAction, isSending] = useActionState(checkoutAction, null)

  let actions = (
    <>
      <Button type="button" textOnly onClick={handleClose}>
        Kapat
      </Button>
      <Button> Siparişi Onayla </Button>
    </>
  );

  if(isSending){
    actions = <span>Sipariş gönderiliyor...</span>
  }

  if(data && !error){
    return <Modal open={userProgressCtx.progress === 'checkout'} onClose={handleFinish}>
      <h2>Başarılı!</h2>
      <p>Siparişiniz başarıyla iletilmiştir.</p>
      <p>Siparişinizle ilgili detaylar için önümüzdeki dakikalarda sizinle iletişime geçeceğiz.</p>
      <p className="modal-actions">
        <Button onClick={handleFinish}>Tamam</Button>
      </p>
    </Modal>
  }

  return (
    <Modal open={userProgressCtx.progress === "checkout"} onClose={handleClose}>
      <form action={formAction}>
        <h2>Ödeme</h2>
        <p>Toplam Tutar:{currencyFormatter.format(cartTotal)}</p>
        <Input label="AD/SOYAD" type="text" id="name" />
        <Input label="E-MAIL" type="email" id="email" />
        <Input label="SOKAK" type="text" id="street" />
        <div className="control-row">
          <Input label="Posta Kodu" type="text" id="postal-code" />
          <Input label="Şehir" type="text" id="city" />
        </div>

            {error && <Error title="Sipariş onaylanmadı" message={error}/>}

        <p className="modal-actions">{actions}</p>
      </form>
    </Modal>
  );
}
