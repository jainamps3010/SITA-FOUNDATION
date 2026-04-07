import 'package:get/get.dart';
import '../../data/models/order_model.dart';

class OrderDetailController extends GetxController {
  late final Order order;

  @override
  void onInit() {
    super.onInit();
    order = Get.arguments as Order;
  }
}
