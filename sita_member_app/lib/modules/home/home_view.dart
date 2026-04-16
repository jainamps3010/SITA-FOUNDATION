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
          // SITA logo
          Center(
            child: Image.asset(
              'assets/logo.png',
              height: 80,
              fit: BoxFit.contain,
              errorBuilder: (c, e, s) => const Text(
                'SITA Foundation',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 12),
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
                color: AppColors.primary.withValues(alpha: 0.3),
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

      // Not yet paid — simple prompt card
      if (!m.membershipPaid) {
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
                    color: AppColors.warning.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.pending_outlined,
                      color: AppColors.warning, size: 24),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Membership Pending',
                          style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                      Text('Complete annual membership payment to order',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      }

      final days = m.daysUntilExpiry;
      final isExpired = m.isMembershipExpired;
      final isExpiringSoon = m.isExpiringSoon;

      // Expired — red banner
      if (isExpired) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFFFEBEE),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.red.shade300),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.cancel_outlined, color: Colors.red, size: 22),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text('Membership Expired — Renew Now',
                          style: TextStyle(
                              color: Colors.red,
                              fontWeight: FontWeight.w700,
                              fontSize: 15)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  m.membershipExpiryDate != null
                      ? 'Expired on ${_formatDate(m.membershipExpiryDate!)}'
                      : 'Your membership has expired',
                  style: TextStyle(color: Colors.red.shade700, fontSize: 12),
                ),
                const SizedBox(height: 12),
                Obx(() => SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: controller.isRenewing.value
                            ? null
                            : () => controller.renewMembership(Get.context!),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            minimumSize: const Size(double.infinity, 44)),
                        icon: controller.isRenewing.value
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                    color: Colors.white, strokeWidth: 2))
                            : const Icon(Icons.autorenew, size: 18),
                        label: Text(controller.isRenewing.value
                            ? 'Processing...'
                            : 'Renew Membership  •  ₹5,000'),
                      ),
                    )),
              ],
            ),
          ),
        );
      }

      // Expiring soon — orange warning
      if (isExpiringSoon) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF8E1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.orange.shade300),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.warning_amber_outlined,
                        color: Colors.orange, size: 22),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Renew Soon — $days day${days == 1 ? '' : 's'} left',
                        style: const TextStyle(
                            color: Colors.orange,
                            fontWeight: FontWeight.w700,
                            fontSize: 15),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  m.membershipExpiryDate != null
                      ? 'Expires on ${_formatDate(m.membershipExpiryDate!)}'
                      : '',
                  style: TextStyle(color: Colors.orange.shade800, fontSize: 12),
                ),
                const SizedBox(height: 12),
                Obx(() => SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: controller.isRenewing.value
                            ? null
                            : () => controller.renewMembership(Get.context!),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.orange.shade800,
                          side: BorderSide(color: Colors.orange.shade400),
                          minimumSize: const Size(double.infinity, 44),
                        ),
                        icon: const Icon(Icons.autorenew, size: 18),
                        label: const Text('Renew Membership  •  ₹5,000'),
                      ),
                    )),
              ],
            ),
          ),
        );
      }

      // Active — green status card
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
                  color: AppColors.success.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.verified, color: AppColors.success, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Membership Active',
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                    if (m.membershipExpiryDate != null)
                      Text(
                        'Expires: ${_formatDate(m.membershipExpiryDate!)}  •  $days day${days == 1 ? '' : 's'} left',
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 12),
                      ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('Active',
                    style: TextStyle(
                        color: AppColors.success,
                        fontWeight: FontWeight.w700,
                        fontSize: 12)),
              ),
            ],
          ),
        ),
      );
    });
  }

  String _formatDate(DateTime dt) {
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
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
                  color: action.color.withValues(alpha: 0.1),
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
