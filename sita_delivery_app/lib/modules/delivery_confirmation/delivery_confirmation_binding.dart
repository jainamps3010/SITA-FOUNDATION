import 'package:get/get.dart';
import 'delivery_confirmation_controller.dart';

class DeliveryConfirmationBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DeliveryConfirmationController>(
        () => DeliveryConfirmationController());
  }
}
