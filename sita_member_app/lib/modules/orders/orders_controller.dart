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

  /// Calculates per-item penalty for display preview (used before API count is loaded).
  double _calcPenalty(Order order) {
    double penalty = 0.0;
    for (final item in order.items) {
      final market = item.marketPrice ?? item.unitPrice;
      final diff = market - item.unitPrice;
      if (diff > 0) penalty += diff * item.quantity;
    }
    return penalty;
  }

  Future<void> showCancelDialog(BuildContext context, Order order,
      {bool navigateBack = false}) async {
    // Fetch real cancellation count from backend first
    int cancelCount = 0;
    try {
      final res = await Get.find<ApiService>().get('/members/cancellation-count');
      cancelCount = (res['count'] as num?)?.toInt() ?? 0;
    } catch (_) {
      // fall back to local count if network fails
      cancelCount = orders.where((o) => o.status == 'cancelled').length;
    }

    if (!context.mounted) return;

    final isFirstCancellation = cancelCount == 0;
    final penalty = _calcPenalty(order);
    final refundPreview = order.totalAmount - penalty;

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(isFirstCancellation ? 'Cancel Order?' : 'Cancel Order — Penalty Applicable'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Order ${order.orderNumber}'),
            const SizedBox(height: 12),
            if (isFirstCancellation) ...[
              // Free cancellation info box
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.check_circle_outline, color: Colors.green, size: 18),
                        SizedBox(width: 8),
                        Text('This is your FREE cancellation.',
                            style: TextStyle(
                                color: Colors.green,
                                fontWeight: FontWeight.w700,
                                fontSize: 13)),
                      ],
                    ),
                    SizedBox(height: 6),
                    Text('Full refund will be credited to your SITA Wallet.',
                        style: TextStyle(color: Colors.green, fontSize: 13)),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.orange.shade200),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.warning_amber_outlined, color: Colors.orange, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Warning: After this, all future cancellations will be charged a penalty equal to the difference between Market Price and SITA Special Price.',
                        style: TextStyle(color: Colors.orange, fontSize: 12, height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Paid cancellation penalty box
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
                        Icon(Icons.cancel_outlined, color: Colors.red, size: 18),
                        SizedBox(width: 8),
                        Text('Your free cancellation has been used.',
                            style: TextStyle(
                                color: Colors.red,
                                fontWeight: FontWeight.w700,
                                fontSize: 13)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _dialogRow('Penalty Amount',
                        '₹${penalty.toStringAsFixed(2)}', Colors.red),
                    const SizedBox(height: 4),
                    Text('(Difference between Market Price and SITA Price)',
                        style: TextStyle(color: Colors.red.shade400, fontSize: 11)),
                    const Divider(height: 16),
                    _dialogRow('Refund to Wallet',
                        '₹${refundPreview.toStringAsFixed(2)}', Colors.green.shade700),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'As per SITA Foundation cancellation policy, a penalty will be deducted from your refund amount.',
                style: TextStyle(color: Colors.grey.shade600, fontSize: 12, height: 1.4),
              ),
            ],
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
              cancelOrder(order.id, navigateBack: navigateBack);
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                minimumSize: const Size(80, 40)),
            child: Text(isFirstCancellation ? 'Cancel for Free' : 'Cancel with Penalty'),
          ),
        ],
      ),
    );
  }

  Widget _dialogRow(String label, String value, Color valueColor) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13)),
          Text(value,
              style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: valueColor)),
        ],
      );

  Future<void> cancelOrder(String orderId, {bool navigateBack = false}) async {
    isCancelling.value = true;
    try {
      final res = await Get.find<ApiService>().post('/orders/$orderId/cancel', {});
      final refund = (res['refund'] as num?)?.toDouble() ?? 0.0;
      final penalty = (res['penalty'] as num?)?.toDouble() ?? 0.0;

      // Navigate back to orders list before refreshing (avoids stale detail view)
      if (navigateBack) Get.back();

      selectedOrder.value = null;
      await fetchOrders();

      final message = penalty > 0
          ? 'Order cancelled. ₹${refund.toStringAsFixed(2)} credited to your SITA Wallet after ₹${penalty.toStringAsFixed(2)} penalty deduction.'
          : 'Order cancelled. ₹${refund.toStringAsFixed(2)} credited to your SITA Wallet. Note: Future cancellations will incur a penalty.';

      Get.snackbar(
        'Order Cancelled',
        message,
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green.shade50,
        colorText: Colors.green.shade800,
        duration: const Duration(seconds: 5),
        margin: const EdgeInsets.all(12),
      );
    } catch (e) {
      Get.snackbar(
        'Cancellation Failed',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.shade50,
        colorText: Colors.red.shade800,
        duration: const Duration(seconds: 5),
        margin: const EdgeInsets.all(12),
      );
    } finally {
      isCancelling.value = false;
    }
  }
}
