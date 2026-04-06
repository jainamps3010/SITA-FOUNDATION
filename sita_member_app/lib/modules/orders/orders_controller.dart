import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../data/models/order_model.dart';

class OrdersController extends GetxController {
  final orders = <Order>[].obs;
  final selectedOrder = Rxn<Order>();
  final isLoading = false.obs;
  final selectedStatus = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchOrders();
  }

  Future<void> fetchOrders() async {
    isLoading.value = true;
    try {
      String path = '/members/orders?limit=50';
      if (selectedStatus.value.isNotEmpty) path += '&status=${selectedStatus.value}';
      final res = await Get.find<ApiService>().get(path);
      orders.value = (res['data'] as List<dynamic>? ?? [])
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchOrderDetail(String id) async {
    isLoading.value = true;
    try {
      final res = await Get.find<ApiService>().get('/orders/$id');
      selectedOrder.value = Order.fromJson(res['order'] as Map<String, dynamic>);
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  void filterByStatus(String status) {
    selectedStatus.value = status;
    fetchOrders();
  }
}
