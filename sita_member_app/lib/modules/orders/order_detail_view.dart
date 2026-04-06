import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../app/theme/app_theme.dart';
import '../../data/models/order_model.dart';
import '../../widgets/common_widgets.dart';
import 'orders_controller.dart';

class OrderDetailView extends GetView<OrdersController> {
  const OrderDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    final initialOrder = Get.arguments as Order?;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: SitaAppBar(
        title: initialOrder?.orderNumber ?? 'Order Detail',
      ),
      body: Obx(() {
        final order = controller.selectedOrder.value ?? initialOrder;
        if (order == null) return const LoadingWidget();

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Status tracker
              _buildStatusTracker(order.status),
              const SizedBox(height: 16),
              // Order info
              _section('Order Information', [
                _row('Order Number', order.orderNumber),
                _row('Date',
                    DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt)),
                _row('Payment', order.paymentMethod.replaceAll('_', ' ')),
                _row('Payment Status', order.paymentStatus),
              ]),
              const SizedBox(height: 12),
              if (order.vendor != null) ...[
                _section('Vendor', [
                  _row('Company', order.vendor!.companyName),
                  if (order.vendor!.phone != null)
                    _row('Phone', order.vendor!.phone!),
                ]),
                const SizedBox(height: 12),
              ],
              _section('Delivery Address', [
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Text(order.deliveryAddress,
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 13, height: 1.4)),
                ),
              ]),
              const SizedBox(height: 12),
              // Items
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Order Items',
                        style: TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 15)),
                    const SizedBox(height: 12),
                    ...order.items.map((item) => _itemRow(item)),
                    const Divider(height: 20),
                    _billRow('Subtotal',
                        '₹${(order.totalAmount - order.sitaCommission).toStringAsFixed(2)}'),
                    _billRow('Foundation Fee (2%)',
                        '₹${order.sitaCommission.toStringAsFixed(2)}',
                        sub: 'Non-refundable'),
                    const Divider(height: 12),
                    _billRow(
                        'Total', '₹${order.totalAmount.toStringAsFixed(2)}',
                        bold: true),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildStatusTracker(String status) {
    final steps = ['pending', 'confirmed', 'dispatched', 'delivered'];
    final activeIdx = steps.indexOf(status);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Order Status',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
              StatusBadge(status: status),
            ],
          ),
          const SizedBox(height: 16),
          if (!['cancelled', 'disputed'].contains(status))
            Row(
              children: List.generate(steps.length * 2 - 1, (i) {
                if (i.isOdd) {
                  final stepIdx = i ~/ 2;
                  return Expanded(
                    child: Container(
                      height: 2,
                      color: stepIdx < activeIdx
                          ? AppColors.primary
                          : AppColors.divider,
                    ),
                  );
                }
                final stepIdx = i ~/ 2;
                final done = stepIdx <= activeIdx;
                return Column(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: done ? AppColors.primary : Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: done ? AppColors.primary : AppColors.divider,
                          width: 2,
                        ),
                      ),
                      child: done
                          ? const Icon(Icons.check, color: Colors.white, size: 14)
                          : null,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      steps[stepIdx][0].toUpperCase() +
                          steps[stepIdx].substring(1),
                      style: TextStyle(
                        fontSize: 9,
                        color: done ? AppColors.primary : AppColors.textSecondary,
                        fontWeight:
                            done ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ],
                );
              }),
            ),
        ],
      ),
    );
  }

  Widget _section(String title, List<Widget> children) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 15)),
            const SizedBox(height: 10),
            ...children,
          ],
        ),
      );

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 13)),
            Flexible(
              child: Text(value,
                  textAlign: TextAlign.right,
                  style: const TextStyle(
                      fontWeight: FontWeight.w500, fontSize: 13)),
            ),
          ],
        ),
      );

  Widget _itemRow(OrderItem item) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.productName,
                      style: const TextStyle(
                          fontWeight: FontWeight.w500, fontSize: 13)),
                  Text(
                      '${item.quantity} ${item.productUnit} × ₹${item.unitPrice.toStringAsFixed(2)}',
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 12)),
                ],
              ),
            ),
            Text('₹${item.totalPrice.toStringAsFixed(2)}',
                style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 13)),
          ],
        ),
      );

  Widget _billRow(String label, String value,
          {bool bold = false, String? sub}) =>
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        fontWeight:
                            bold ? FontWeight.w700 : FontWeight.normal,
                        fontSize: bold ? 15 : 13,
                        color: bold
                            ? AppColors.textPrimary
                            : AppColors.textSecondary)),
                if (sub != null)
                  Text(sub,
                      style: const TextStyle(
                          color: AppColors.error, fontSize: 10)),
              ],
            ),
            Text(value,
                style: TextStyle(
                    fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
                    fontSize: bold ? 16 : 13,
                    color: bold ? AppColors.primary : AppColors.textPrimary)),
          ],
        ),
      );
}
