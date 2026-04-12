import 'package:get/get.dart';
import 'membership_payment_controller.dart';

class MembershipPaymentBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MembershipPaymentController>(() => MembershipPaymentController());
  }
}
