import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'modules/splash/splash_view.dart';
import 'modules/auth/login_view.dart';
import 'modules/auth/auth_binding.dart';
import 'modules/deliveries/deliveries_view.dart';
import 'modules/deliveries/deliveries_binding.dart';
import 'modules/order_detail/order_detail_view.dart';
import 'modules/order_detail/order_detail_binding.dart';
import 'modules/delivery_confirmation/delivery_confirmation_view.dart';
import 'modules/delivery_confirmation/delivery_confirmation_binding.dart';
import 'modules/defect_report/defect_report_view.dart';
import 'modules/defect_report/defect_report_binding.dart';

void main() {
  runApp(const SitaDeliveryApp());
}

class SitaDeliveryApp extends StatelessWidget {
  const SitaDeliveryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'SITA Delivery',
      debugShowCheckedModeBanner: false,
      initialRoute: '/splash',
      getPages: [
        GetPage(name: '/splash', page: () => const SplashView()),
        GetPage(
          name: '/login',
          page: () => const LoginView(),
          binding: AuthBinding(),
        ),
        GetPage(
          name: '/deliveries',
          page: () => const DeliveriesView(),
          binding: DeliveriesBinding(),
        ),
        GetPage(
          name: '/order-detail',
          page: () => const OrderDetailView(),
          binding: OrderDetailBinding(),
        ),
        GetPage(
          name: '/delivery-confirmation',
          page: () => const DeliveryConfirmationView(),
          binding: DeliveryConfirmationBinding(),
        ),
        GetPage(
          name: '/defect-report',
          page: () => const DefectReportView(),
          binding: DefectReportBinding(),
        ),
      ],
    );
  }
}
