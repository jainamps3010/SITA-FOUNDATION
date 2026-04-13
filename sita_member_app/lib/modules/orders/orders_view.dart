import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../app/theme/app_theme.dart';
import '../../app/routes/app_routes.dart';
import '../../data/models/order_model.dart';
import '../../widgets/common_widgets.dart';
import 'orders_controller.dart';

class OrdersView extends GetView<OrdersController> {
  const OrdersView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const SitaAppBar(title: 'My Orders'),
      body: Column(
        children: [
          _buildFilters(),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) return const LoadingWidget();
              if (controller.orders.isEmpty) {
                return const EmptyWidget(
                  message: 'No orders found.\nStart ordering from the marketplace.',
                  icon: Icons.receipt_long_outlined,
                );
              }
              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: controller.fetchOrders,
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: controller.orders.length,
                  itemBuilder: (_, i) => _OrderCard(order: controller.orders[i]),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    final statuses = ['All', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
    return SizedBox(
      height: 48,
      child: Obx(() => ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            itemCount: statuses.length,
            itemBuilder: (_, i) {
              final s = statuses[i];
              final selected = controller.selectedStatus.value == s ||
                  (s == 'All' && controller.selectedStatus.value.isEmpty);
              return GestureDetector(
                onTap: () =>
                    controller.filterByStatus(s == 'All' ? '' : s),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  decoration: BoxDecoration(
                    color: selected ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: selected ? AppColors.primary : AppColors.divider),
                  ),
                  child: Text(
                    s[0].toUpperCase() + s.substring(1),
                    style: TextStyle(
                      color: selected ? Colors.white : AppColors.textSecondary,
                      fontSize: 13,
                      fontWeight:
                          selected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ),
              );
            },
          )),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM yyyy, hh:mm a');
    final ctrl = Get.find<OrdersController>();
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          ctrl.fetchOrderDetail(order.id);
          Get.toNamed(Routes.orderDetail, arguments: order);
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    order.orderNumber,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: AppColors.textPrimary),
                  ),
                  StatusBadge(status: order.status),
                ],
              ),
              const SizedBox(height: 6),
              if (order.vendor != null)
                Text(order.vendor!.companyName,
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 13)),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.access_time_outlined,
                      color: AppColors.textSecondary, size: 14),
                  const SizedBox(width: 4),
                  Text(fmt.format(order.createdAt),
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 12)),
                ],
              ),
              const SizedBox(height: 10),
              const Divider(height: 1),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${order.items.length} item${order.items.length > 1 ? 's' : ''}',
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 12),
                      ),
                      Text(
                        order.items.map((i) => i.productName).take(2).join(', ') +
                            (order.items.length > 2
                                ? ' +${order.items.length - 2} more'
                                : ''),
                        style: const TextStyle(fontSize: 12),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                  Text(
                    '₹${order.totalAmount.toStringAsFixed(2)}',
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                        fontSize: 16),
                  ),
                ],
              ),
              if (['pending', 'dispatched'].contains(order.status)) ...[
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => ctrl.showCancelDialog(context, order),
                    icon: const Icon(Icons.cancel_outlined,
                        color: Colors.red, size: 16),
                    label: const Text('Cancel Order',
                        style: TextStyle(color: Colors.red, fontSize: 13)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      minimumSize: const Size(0, 36),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
