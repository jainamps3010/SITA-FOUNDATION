import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../data/models/order_model.dart';

class OrdersController extends GetxController {
  final orders = <Order>[].obs;
  final selectedOrder = Rxn<Order>();
  final isLoading = false.obs;
  final isCancelling = false.obs;
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

  /// Returns the cancellation penalty for an order.
  /// First cancellation = 0 (free). Second+ = SUM((market_price - sita_price) * qty).
  double _calcPenalty(Order order) {
    // Count already-cancelled orders to determine if this is first or subsequent
    final cancelledCount = orders.where((o) => o.status == 'cancelled').length;
    if (cancelledCount == 0) return 0.0;
    double penalty = 0.0;
    for (final item in order.items) {
      final market = item.marketPrice ?? item.unitPrice;
      final diff = market - item.unitPrice;
      if (diff > 0) penalty += diff * item.quantity;
    }
    return penalty;
  }

  void showCancelDialog(BuildContext context, Order order) {
    final penalty = _calcPenalty(order);
    final isFree = penalty == 0.0;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Order'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Are you sure you want to cancel order ${order.orderNumber}?'),
            const SizedBox(height: 12),
            if (isFree)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle_outline,
                        color: Colors.green, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'First cancellation: 100% refund to SITA Wallet.',
                        style: TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.w600,
                            fontSize: 13),
                      ),
                    ),
                  ],
                ),
              )
            else
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.warning_amber_outlined,
                            color: Colors.red, size: 18),
                        SizedBox(width: 8),
                        Text('Cancellation Penalty',
                            style: TextStyle(
                                color: Colors.red,
                                fontWeight: FontWeight.w700,
                                fontSize: 13)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '₹${penalty.toStringAsFixed(2)} will be deducted\n(market price − SITA price × qty)',
                      style: TextStyle(
                          color: Colors.red.shade700, fontSize: 12),
                    ),
                  ],
                ),
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Keep Order'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              cancelOrder(order.id);
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                minimumSize: const Size(80, 40)),
            child: const Text('Cancel Order'),
          ),
        ],
      ),
    );
  }

  Future<void> cancelOrder(String orderId) async {
    isCancelling.value = true;
    try {
      await Get.find<ApiService>().post('/orders/$orderId/cancel', {});
      Get.snackbar(
        'Order Cancelled',
        'Your order has been cancelled. Refund processed to SITA Wallet.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green.shade50,
        colorText: Colors.green.shade800,
        duration: const Duration(seconds: 4),
      );
      // Refresh orders list and clear selected
      selectedOrder.value = null;
      await fetchOrders();
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isCancelling.value = false;
    }
  }
}
