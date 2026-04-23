import 'package:get/get.dart';
import '../../data/models/order_model.dart';
import '../../app/routes/app_routes.dart';
import '../cart/cart_controller.dart';

class EditReorderController extends GetxController {
  final unavailableItems = <OrderItem>[].obs;

  CartController get cart => Get.find<CartController>();

  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments as Map<String, dynamic>?;
    if (args != null) {
      final items = args['unavailableItems'] as List<OrderItem>? ?? [];
      unavailableItems.assignAll(items);
    }
  }

  void addMoreProducts() => Get.toNamed(Routes.marketplace);

  void goToCart() {
    if (cart.items.isEmpty) {
      Get.snackbar(
        'No Items',
        'Please add at least one item before placing order.',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    Get.toNamed(Routes.cart);
  }
}
