import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../app/theme/app_theme.dart';
import '../../app/routes/app_routes.dart';
import '../../widgets/common_widgets.dart';
import '../cart/cart_controller.dart';
import 'home_controller.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primary,
          onRefresh: controller.fetchProfile,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _buildHeader()),
              SliverToBoxAdapter(child: _buildWalletCard()),
              SliverToBoxAdapter(child: _buildQuickActions()),
              SliverToBoxAdapter(child: _buildMembershipStatus()),
              SliverToBoxAdapter(child: _buildRecentSection()),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _BottomNav(),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
      decoration: const BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Good morning,',
                        style: TextStyle(color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 2),
                    Obx(() => Text(
                          controller.member.value?.name ?? 'Member',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w700),
                        )),
                    Obx(() {
                      final hotel = controller.member.value?.hotelName;
                      if (hotel == null) return const SizedBox.shrink();
                      return Text(hotel,
                          style: const TextStyle(
                              color: Colors.white60, fontSize: 12));
                    }),
                  ],
                ),
              ),
              // Cart icon
              Obx(() {
                final cart = Get.find<CartController>();
                return Stack(
                  children: [
                    IconButton(
                      onPressed: () => Get.toNamed(Routes.cart),
                      icon: const Icon(Icons.shopping_cart_outlined,
                          color: Colors.white, size: 26),
                    ),
                    if (cart.count > 0)
                      Positioned(
                        right: 6,
                        top: 6,
                        child: Container(
                          width: 18,
                          height: 18,
                          decoration: const BoxDecoration(
                            color: AppColors.accent,
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              '${cart.count}',
                              style: const TextStyle(
                                  fontSize: 10, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              }),
              IconButton(
                onPressed: controller.logout,
                icon: const Icon(Icons.logout, color: Colors.white70, size: 22),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWalletCard() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: GestureDetector(
        onTap: () => Get.toNamed(Routes.wallet),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, AppColors.primaryLight],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.3),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            children: [
              const Icon(Icons.account_balance_wallet_outlined,
                  color: Colors.white70, size: 36),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('SITA Wallet Balance',
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                    const SizedBox(height: 4),
                    Obx(() => Text(
                          '₹${(controller.member.value?.walletBalance ?? 0.0).toStringAsFixed(2)}',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 26,
                              fontWeight: FontWeight.w800),
                        )),
                    const Text('Store Credit',
                        style: TextStyle(color: Colors.white60, fontSize: 11)),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios,
                  color: Colors.white60, size: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      _QuickAction(
          icon: Icons.storefront_outlined,
          label: 'Marketplace',
          color: const Color(0xFF2196F3),
          onTap: () => Get.toNamed(Routes.marketplace)),
      _QuickAction(
          icon: Icons.receipt_long_outlined,
          label: 'My Orders',
          color: const Color(0xFFFF9800),
          onTap: () => Get.toNamed(Routes.orders)),
      _QuickAction(
          icon: Icons.account_balance_wallet_outlined,
          label: 'Wallet',
          color: AppColors.primary,
          onTap: () => Get.toNamed(Routes.wallet)),
      _QuickAction(
          icon: Icons.person_outline,
          label: 'Profile',
          color: const Color(0xFF9C27B0),
          onTap: () => Get.toNamed(Routes.profile)),
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Quick Actions',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary)),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: actions
                .map((a) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: _QuickActionCard(action: a),
                      ),
                    ))
                .toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildMembershipStatus() {
    return Obx(() {
      final m = controller.member.value;
      if (m == null) return const SizedBox.shrink();
      return Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: m.membershipPaid
                      ? AppColors.success.withOpacity(0.1)
                      : AppColors.warning.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  m.membershipPaid ? Icons.verified : Icons.pending_outlined,
                  color:
                      m.membershipPaid ? AppColors.success : AppColors.warning,
                  size: 24,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      m.membershipPaid
                          ? 'Active Member'
                          : 'Membership Pending',
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 15),
                    ),
                    Text(
                      m.membershipPaid
                          ? 'You have full marketplace access'
                          : 'Complete membership payment to order',
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
              StatusBadge(status: m.status),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildRecentSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Browse Marketplace',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary)),
              TextButton(
                onPressed: () => Get.toNamed(Routes.marketplace),
                child: const Text('See All',
                    style: TextStyle(color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: () => Get.toNamed(Routes.marketplace),
            icon: const Icon(Icons.shopping_bag_outlined),
            label: const Text('Explore Products'),
          ),
        ],
      ),
    );
  }
}

class _QuickAction {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  _QuickAction(
      {required this.icon,
      required this.label,
      required this.color,
      required this.onTap});
}

class _QuickActionCard extends StatelessWidget {
  final _QuickAction action;
  const _QuickActionCard({required this.action});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: action.onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider),
          ),
          child: Column(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: action.color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(action.icon, color: action.color, size: 22),
              ),
              const SizedBox(height: 8),
              Text(action.label,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                  textAlign: TextAlign.center),
            ],
          ),
        ),
      );
}

class _BottomNav extends GetView<HomeController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() => BottomNavigationBar(
          currentIndex: controller.currentIndex.value,
          onTap: (i) {
            controller.currentIndex.value = i;
            switch (i) {
              case 0:
                break;
              case 1:
                Get.toNamed(Routes.marketplace);
                break;
              case 2:
                Get.toNamed(Routes.orders);
                break;
              case 3:
                Get.toNamed(Routes.profile);
                break;
            }
          },
          items: const [
            BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home),
                label: 'Home'),
            BottomNavigationBarItem(
                icon: Icon(Icons.storefront_outlined),
                activeIcon: Icon(Icons.storefront),
                label: 'Market'),
            BottomNavigationBarItem(
                icon: Icon(Icons.receipt_long_outlined),
                activeIcon: Icon(Icons.receipt_long),
                label: 'Orders'),
            BottomNavigationBarItem(
                icon: Icon(Icons.person_outline),
                activeIcon: Icon(Icons.person),
                label: 'Profile'),
          ],
        ));
  }
}
