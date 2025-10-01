import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRout from "./protectedRout/ProtectedRout";
import {
  LoginPage,
  SignUpPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  EventsPage,
  FaqPage,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
  OrderSuccessPage,
  PaymentPage,
  CheckoutPage,
  OrderDetailsPage,
  TrackOrderPage,
  UserInbox,
} from "./protectedRout/Routes";
import {
  ShopDashboardPage,
  ShopHomePage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopCreateEvents,
  ShopAllEvents,
  ShopAllCoupouns,
  ShopPreviewPage,
  ShopAllOrders,
  ShopOrdersDetails,
  ShopAllRefunds,
  ShopSettingsPage,
  ShopWithdrawMoneyPage,
  ShopInboxPage,
} from "./protectedRout/ShopRout";
import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardEvents,
  AdminDashboardWithdraw,
} from "./protectedRout/AdminRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Store from "./redux/store";
import { loadUser } from "./redux/actions/user";
import { loadShop } from "./redux/actions/user";

import { useSelector } from "react-redux";
import SellerProtectedRout from "./protectedRout/SellerProtecredRout";
import Loader from "./components/layout/loader";
import { getAllEvents } from "./redux/actions/event";
import { getAllProducts } from "./redux/actions/product";
import axios from "axios";
import { server } from "./server";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ProtectedAdminRoute from "./protectedRout/ProtectedAdminRoute";

const App = () => {
  const [stripeApikey, setStripeApikey] = useState("");

  async function getStripeApikey(params) {
    const { data } = await axios.get(`${server}/payment/stripeapikey`);
    setStripeApikey(data.stripeApikey);
  }

  const { loading, isAuthenticated } = useSelector((state) => state.user);
  const { isLoading, isSeller } = useSelector((state) => state.seller);
  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadShop());
    Store.dispatch(getAllProducts());
    Store.dispatch(getAllEvents());
    getStripeApikey();
  }, []);
  return (
    <>
      {loading || isLoading ? (
        <Loader />
      ) : (
        <BrowserRouter>
          {stripeApikey && (
            <Elements stripe={loadStripe(stripeApikey)}>
              <Routes>
                <Route
                  path="/payment"
                  element={
                    <ProtectedRout isAuthenticated={isAuthenticated}>
                      <PaymentPage />
                    </ProtectedRout>
                  }
                />
              </Routes>
            </Elements>
          )}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route
              path="/activation/:activation_token"
              element={<ActivationPage />}
            />
            <Route
              path="/seller/activation/:activation_token"
              element={<SellerActivationPage />}
            />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            {/* <Route path="/event/:id" element={<EventDetailsPage />} /> */}
            <Route path="/best-selling" element={<BestSellingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <CheckoutPage />
                </ProtectedRout>
              }
            />

            <Route path="/order/success" element={<OrderSuccessPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <ProfilePage />
                </ProtectedRout>
              }
            />
            <Route
              path="/inbox"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <UserInbox />
                </ProtectedRout>
              }
            />
            <Route
              path="/user/order/:id"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <OrderDetailsPage />
                </ProtectedRout>
              }
            />
            <Route
              path="/user/track/order/:id"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <TrackOrderPage />
                </ProtectedRout>
              }
            />
            <Route
              path="/shop/preview/:id"
              element={
                // <SellerProtectedRout isSeller={isSeller}>
                <ShopPreviewPage />
                // </SellerProtectedRout>
              }
            />
            {/* SHOP ROUTE */}
            <Route path="/shop-create" element={<ShopCreatePage />} />
            <Route path="/shop-login" element={<ShopLoginPage />} />
            <Route
              path="/shop/:id"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopHomePage />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/settings"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopSettingsPage />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopDashboardPage />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-create-product"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopCreateProduct />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-orders"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllOrders />
                </SellerProtectedRout>
              }
            />
            <Route
              path=" /dashboard-refunds"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllRefunds />
                </SellerProtectedRout>
              }
            />

            <Route
              path="/dashboard-orders"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllOrders />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/order/:id"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopOrdersDetails />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-create-event"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopCreateEvents />
                </SellerProtectedRout>
              }
            />

            <Route
              path="/dashboard-events"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllEvents />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-coupouns"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllCoupouns />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-withdraw-money"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopWithdrawMoneyPage />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-messages"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopInboxPage />
                </SellerProtectedRout>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-users"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardUsers />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-sellers"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardSellers />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-orders"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardOrders />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-products"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardProducts />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-events"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardEvents />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-withdraw-request"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardWithdraw />
                </ProtectedAdminRoute>
              }
            />
          </Routes>

          <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
