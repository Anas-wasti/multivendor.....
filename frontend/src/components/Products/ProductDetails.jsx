import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/style";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsShop } from "../../redux/actions/product";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import { addToCart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "./Ratings";
import axios from "axios";

const ProductDetails = ({ data }) => {
  // defensive selectors with fallbacks
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { products } = useSelector((state) => state.products);

  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data?.shop?._id) {
      dispatch(getAllProductsShop(data.shop._id));
    }

    if (
      data &&
      Array.isArray(wishlist) &&
      wishlist.find((i) => i._id === data._id)
    ) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [data, wishlist, dispatch]);

  function increment() {
    setCount((c) => c + 1);
  }
  function decrement() {
    setCount((c) => (c > 1 ? c - 1 : c));
  }

  const removeFromWishlistHandler = (item) => {
    setClick(false);
    dispatch(removeFromWishlist(item));
  };

  const addFromWishlistHandler = (item) => {
    setClick(true);
    dispatch(addToWishlist(item));
  };

  const addToCartHandler = (id) => {
    const isItemExists = Array.isArray(cart) && cart.find((i) => i?._id === id);
    if (isItemExists) {
      toast.error("Item already in cart");
      return;
    }
    if (!data) return;

    const stock = Number(data.stock ?? data?.stock ?? 0);
    if (stock < 1) {
      toast.error("Product stock limited");
      return;
    }

    const cartData = { ...data, qty: count };
    dispatch(addToCart(cartData));
    toast.success("Item added to cart successfully!");
  };

  // defensive image/shop access (support multiple possible API field names)
  const images =
    data?.images ||
    data?.image ||
    (data?.image_Url
      ? Array.isArray(data.image_Url)
        ? data.image_Url.map((i) => i.url || i)
        : [data.image_Url.url || data.image_Url]
      : []);
  const displayedImage = images[select] || images[0] || "";
  const shopName = data?.shop?.name || "";
  const discountPrice = data?.discount_price ?? data?.discountPrice ?? null;
  const price = data?.price ?? data?.originalPrice ?? null;

  const totalReviewsLength =
    products &&
    products.reduce((acc, product) => acc + product.reviews.length, 0);

  const totalRatings =
    products &&
    products.reduce(
      (acc, product) =>
        acc + product.reviews.reduce((sum, review) => sum + review.rating, 0),
      0
    );

  const averageRating = totalRatings / totalReviewsLength || 0;

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      const groupTitle = data._id + user._id;
      const userId = user._id;
      const sellerId = data.shop._id;
      await axios
        .post(
          `${server}/conversation/create-new-conversation`,
          {
            groupTitle,
            userId,
            sellerId,
          },
          { withCredentials: true }
        )
        .then((res) => {
          navigate(`/conversation/${res.data.conversation._id}`);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    } else {
      toast.error("Please login to create a conversation");
    }
  };

  return (
    <div className="bg-white">
      {data ? (
        <div className={`unset ${styles.section} w-[90%] 800px:w-[80%] h-full`}>
          {/* TOP COMPONENT */}
          <div className="w-full py-5 ">
            <div className="w-full 800px:flex">
              {/* LEFT SIDE CONTENT */}
              <div className="w-full 800px:w-[50%]">
                <img
                  src={`${backend_url}${displayedImage}`}
                  alt={data.name || "product"}
                  className="w-[80%]"
                />
                <div className="w-full flex flex-wrap">
                  {images && images.length > 0 ? (
                    images.map((i, index) => (
                      <div
                        key={index}
                        className={`mr-3 mt-3 cursor-pointer ${
                          select === index ? "border" : ""
                        }`}
                        onClick={() => setSelect(index)}
                      >
                        <img
                          src={`${backend_url}${i}`}
                          alt={`${data.name || "img"}-${index}`}
                          className="h-[200px] object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 mt-3">No images</div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE CONTENT */}
              <div className="w-full 800px:w-[50%] pt-5">
                <h1 className={`${styles.productTitle}`}>{data.name}</h1>
                <p>{data.description}</p>

                {/* PRICE */}
                <div className="flex items-center gap-4 pt-3">
                  {discountPrice ? (
                    <h4 className={`${styles.productDiscountPrice}`}>
                      {discountPrice}$
                    </h4>
                  ) : null}
                  {price ? (
                    <h3 className={`${styles.price}`}>
                      {price ? `${price}$` : null}
                    </h3>
                  ) : null}
                </div>

                {/* QUANTITY + WISHLIST */}
                <div
                  className={`${styles.normalFlex} mt-6 justify-between pr-3`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <button
                        className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                        onClick={decrement}
                      >
                        -
                      </button>
                      <span className="bg-gray-200 text-gray-800 font-medium px-4 py-[11px]">
                        {count}
                      </span>
                      <button
                        className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-r px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                        onClick={increment}
                      >
                        +
                      </button>
                    </div>
                    {/* FAVOURITE */}
                    <div>
                      {click ? (
                        <AiFillHeart
                          size={30}
                          className="cursor-pointer"
                          onClick={() => removeFromWishlistHandler(data)}
                          color="red"
                          title="Remove from wishlist"
                        />
                      ) : (
                        <AiOutlineHeart
                          size={30}
                          className="cursor-pointer"
                          onClick={() => addFromWishlistHandler(data)}
                          color="#333"
                          title="Add to wishlist"
                        />
                      )}
                    </div>
                  </div>

                  {/* ADD TO CART BUTTON */}
                  <div
                    className={`${styles.button} !mt-0 !rounded !h-11 flex items-center cursor-pointer`}
                    onClick={() => addToCartHandler(data._id)}
                  >
                    <span className="text-white flex items-center gap-2">
                      Add to cart <AiOutlineShoppingCart />
                    </span>
                  </div>
                </div>

                {/* SEND MESSAGE */}
                <div className="flex items-center pt-8 gap-4">
                  <Link to={`/shop/preview/${data?.shop?._id}`}>
                    <img
                      src={`${backend_url}${data?.shop?.avatar || ""}`}
                      alt="shop avatar"
                      className="w-[50px] h-[50px] rounded-full mr-2 object-cover"
                    />
                  </Link>
                  <div className="pr-8">
                    <h3 className={`${styles.shop_name} pt-1`}>
                      {shopName || "Shop"}
                    </h3>
                    <h5 className="pb-3 text-[15px]">
                      ({averageRating}/5) Ratings
                    </h5>
                  </div>
                  <div
                    className={`${styles.button} bg-[#6443d1] !rounded !h-11 cursor-pointer`}
                    onClick={handleMessageSubmit}
                  >
                    <span className="text-white flex items-center">
                      Send Message <AiOutlineMessage className="ml-1 mt-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM COMPONENT && MORE INFORMATION ABOUT PRODUCT */}
          <ProductDetailsInfo
            data={data}
            products={products}
            totalReviewsLength={totalReviewsLength}
            averageRating={averageRating}
          />
          <br />
          <br />
        </div>
      ) : null}
    </div>
  );
};

const ProductDetailsInfo = ({
  data,
  products,
  totalReviewsLength,
  averageRating = [],
}) => {
  const [active, setActive] = useState(1);

  return (
    <div className="bg-[#f5f6fb] px-3 800px:px-10 py-2 rounded h-full">
      {/* HEADINGS */}
      <div className="w-full flex justify-between border-b pt-10 pb-2">
        <div className="relative">
          <h5
            className="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-xl"
            onClick={() => setActive(1)}
          >
            Product Detail
          </h5>

          {active === 1 ? (
            <div className={`${styles.active_indicator}`} />
          ) : null}
        </div>
        <div className="relative">
          <h5
            className="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-xl"
            onClick={() => setActive(2)}
          >
            Product Reviews
          </h5>

          {active === 2 ? (
            <div className={`${styles.active_indicator}`} />
          ) : null}
        </div>
        <div className="relative">
          <h5
            className="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-xl"
            onClick={() => setActive(3)}
          >
            Seller Information
          </h5>

          {active === 3 ? (
            <div className={`${styles.active_indicator}`} />
          ) : null}
        </div>
      </div>

      {/* HEADINGS DETAILS */}
      {active === 1 ? (
        <>
          <p className="py-2 text-[18px] leading-8 pb-10 whitespace-pre-line">
            {data.description}
          </p>
        </>
      ) : null}
      {active === 2 ? (
        <div className="w-full justify-center min-h-[40vh] flex flex-col items-center py-3 overflow-y-scroll">
          {data &&
            data.reviews.map((item, index) => {
              <div className="w-full flex my-2">
                <img
                  src={`${backend_url}/${item.user.avatar}`}
                  alt=""
                  className="w-[50px] h-[50px] rounded-full"
                />
                <div className="pl-2">
                  <div className="w-full flex items-center">
                    <h1 className="font-[500] mr-3">{item.user.name}</h1>
                    <Ratings rating={data?.rating} />
                  </div>
                  <p>{item.comment}</p>
                </div>
              </div>;
            })}

          <div className="w-full flex justify-center">
            {data && data.reviews.length === 0 && (
              <h5>No Review have for this product!</h5>
            )}
          </div>
        </div>
      ) : null}
      {active === 3 && (
        <div className="w-full sm:flex justify-between 800px:flex p-5">
          <div className="w-full block 800px:w-[50%]">
            <Link to={`/shop/preview/${data.shop._id}`}>
              <div className="flex items-center">
                <img
                  src={`${backend_url}${data?.shop?.avatar || ""}`}
                  className="w-[50px] h-[50px] rounded-full object-cover"
                  alt="shop"
                />
                <div className="pl-3">
                  <h3 className={`${styles.shop_name}`}>{data.shop.name}</h3>
                  <h4 className="pb-3 text-[15px]">
                    (averageRating)/5 Ratings
                  </h4>
                </div>
              </div>
            </Link>
            <p className="pt-2">{data.shop.description}</p>
          </div>

          <div className="w-full 800px:w-[50%] mt-5 800px:mt-0 flex flex-col items-center">
            <div className="text-left">
              <h5 className="font-[700]">
                Joined on:{" "}
                <span className="font-[500]">
                  {data.shop?.createdAt
                    ? String(data.shop.createdAt).slice(0, 10)
                    : ""}
                </span>
              </h5>
              <h5 className="font-[600] pt-3">
                Total Products:{" "}
                <span className="font-[500]">{products?.length ?? 0}</span>
              </h5>
              <h5 className="font-[600] pt-3">
                Total Reviews:{" "}
                <span className="font-[500]">{totalReviewsLength}</span>
              </h5>
              <Link to="/">
                <div className={`${styles.button} rounded !h-[40px] mt-3`}>
                  <h4 className="text-white font-semibold text-[18px]">
                    Visit Shop
                  </h4>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
