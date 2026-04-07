import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../app/routes/app_routes.dart';
import '../../app/theme/app_theme.dart';
import '../../data/models/order_model.dart';
import 'deliveries_controller.dart';

class DeliveriesView extends GetView<DeliveriesController> {
  const DeliveriesView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Deliveries'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Logout',
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.clear();
              Get.offAllNamed(Routes.login);
            },
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.green),
          );
        }
        if (controller.orders.isEmpty) {
          return RefreshIndicator(
            color: AppColors.green,
            onRefresh: controller.loadOrders,
            child: ListView(
              children: const [
                SizedBox(height: 120),
                Icon(Icons.local_shipping_outlined,
                    size: 72, color: AppColors.greyBorder),
                SizedBox(height: 16),
                Center(
                  child: Text(
                    'No deliveries assigned',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.grey,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          );
        }
        return RefreshIndicator(
          color: AppColors.green,
          onRefresh: controller.loadOrders,
          child: ListView.builder(
            padding: const EdgeInsets.only(top: 8, bottom: 24),
            itemCount: controller.orders.length,
            itemBuilder: (_, i) =>
                _OrderCard(order: controller.orders[i]),
          ),
        );
      }),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final statusColor = _statusColor(order.status);
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Get.toNamed(Routes.orderDetail, arguments: order),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      order.memberName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      order.statusLabel,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: statusColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on_outlined,
                      size: 16, color: AppColors.grey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      order.deliveryAddress,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.grey,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              const Divider(height: 1, color: AppColors.greyBorder),
              const SizedBox(height: 10),
              // Product chips
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: order.items
                    .take(3)
                    .map((item) => _ProductChip(item: item))
                    .toList(),
              ),
              if (order.items.length > 3)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    '+${order.items.length - 3} more items',
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.grey),
                  ),
                ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Order #${order.id}',
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.grey),
                  ),
                  Text(
                    '₹${order.totalAmount.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.green,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'delivered':
        return AppColors.green;
      case 'out_for_delivery':
        return AppColors.blue;
      case 'cancelled':
        return AppColors.red;
      case 'processing':
        return AppColors.orange;
      default:
        return AppColors.grey;
    }
  }
}

class _ProductChip extends StatelessWidget {
  final OrderItem item;
  const _ProductChip({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.greenSurface,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        '${item.productName} ×${item.quantity}',
        style: const TextStyle(
          fontSize: 12,
          color: AppColors.greenDark,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
