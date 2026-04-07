import 'dart:async';
import 'package:get/get.dart';
import '../../app/routes/app_routes.dart';

class SplashController extends GetxController {
  @override
  void onInit() {
    super.onInit();
    Timer(const Duration(seconds: 2), () {
      Get.offAllNamed(Routes.login);
    });
  }
}
