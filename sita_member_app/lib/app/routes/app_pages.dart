import 'package:get/get.dart';
import '../../modules/splash/splash_binding.dart';
import '../../modules/splash/splash_view.dart';
import '../../modules/auth/login_binding.dart';
import '../../modules/auth/login_view.dart';
import '../../modules/auth/otp_verify_view.dart';
import '../../modules/auth/register_view.dart';
import '../../modules/home/home_binding.dart';
import '../../modules/home/home_view.dart';
import '../../modules/marketplace/marketplace_binding.dart';
import '../../modules/marketplace/marketplace_view.dart';
import '../../modules/product_detail/product_detail_binding.dart';
import '../../modules/product_detail/product_detail_view.dart';
import '../../modules/cart/cart_binding.dart';
import '../../modules/cart/cart_view.dart';
import '../../modules/orders/orders_binding.dart';
import '../../modules/orders/orders_view.dart';
import '../../modules/orders/order_detail_view.dart';
import '../../modules/wallet/wallet_binding.dart';
import '../../modules/wallet/wallet_view.dart';
import '../../modules/profile/profile_binding.dart';
import '../../modules/profile/profile_view.dart';
import '../../modules/membership/membership_payment_binding.dart';
import '../../modules/membership/membership_payment_view.dart';
import 'app_routes.dart';

class AppPages {
  static final pages = [
    GetPage(
      name: Routes.splash,
      page: () => const SplashView(),
      binding: SplashBinding(),
    ),
    GetPage(
      name: Routes.login,
      page: () => const LoginView(),
      binding: LoginBinding(),
    ),
    GetPage(
      name: Routes.otpVerify,
      page: () => const OtpVerifyView(),
      binding: LoginBinding(),
    ),
    GetPage(
      name: Routes.register,
      page: () => const RegisterView(),
      binding: LoginBinding(),
    ),
    GetPage(
      name: Routes.membershipPayment,
      page: () => const MembershipPaymentView(),
      binding: MembershipPaymentBinding(),
    ),
    GetPage(
      name: Routes.home,
      page: () => const HomeView(),
      binding: HomeBinding(),
    ),
    GetPage(
      name: Routes.marketplace,
      page: () => const MarketplaceView(),
      binding: MarketplaceBinding(),
    ),
    GetPage(
      name: Routes.productDetail,
      page: () => const ProductDetailView(),
      binding: ProductDetailBinding(),
    ),
    GetPage(
      name: Routes.cart,
      page: () => const CartView(),
      binding: CartBinding(),
    ),
    GetPage(
      name: Routes.orders,
      page: () => const OrdersView(),
      binding: OrdersBinding(),
    ),
    GetPage(
      name: Routes.orderDetail,
      page: () => const OrderDetailView(),
      binding: OrdersBinding(),
    ),
    GetPage(
      name: Routes.wallet,
      page: () => const WalletView(),
      binding: WalletBinding(),
    ),
    GetPage(
      name: Routes.profile,
      page: () => const ProfileView(),
      binding: ProfileBinding(),
    ),
  ];
}
