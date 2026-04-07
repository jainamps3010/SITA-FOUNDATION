import 'package:get/get.dart';
import '../../modules/auth/auth_binding.dart';
import '../../modules/auth/login_view.dart';
import '../../modules/auth/otp_view.dart';
import '../../modules/delivery_confirmation/delivery_confirmation_binding.dart';
import '../../modules/delivery_confirmation/delivery_confirmation_view.dart';
import '../../modules/defect_report/defect_report_binding.dart';
import '../../modules/defect_report/defect_report_view.dart';
import '../../modules/deliveries/deliveries_binding.dart';
import '../../modules/deliveries/deliveries_view.dart';
import '../../modules/order_detail/order_detail_binding.dart';
import '../../modules/order_detail/order_detail_view.dart';
import '../../modules/splash/splash_binding.dart';
import '../../modules/splash/splash_view.dart';
import '../routes/app_routes.dart';

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
      binding: AuthBinding(),
    ),
    GetPage(
      name: Routes.otpVerify,
      page: () => const OtpView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: Routes.deliveries,
      page: () => const DeliveriesView(),
      binding: DeliveriesBinding(),
    ),
    GetPage(
      name: Routes.orderDetail,
      page: () => const OrderDetailView(),
      binding: OrderDetailBinding(),
    ),
    GetPage(
      name: Routes.deliveryConfirmation,
      page: () => const DeliveryConfirmationView(),
      binding: DeliveryConfirmationBinding(),
    ),
    GetPage(
      name: Routes.defectReport,
      page: () => const DefectReportView(),
      binding: DefectReportBinding(),
    ),
  ];
}
