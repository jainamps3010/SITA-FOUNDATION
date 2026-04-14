import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../app/theme/app_theme.dart';
import '../../data/models/wallet_model.dart';
import '../../widgets/common_widgets.dart';
import 'wallet_controller.dart';

class WalletView extends GetView<WalletController> {
  const WalletView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const SitaAppBar(title: 'SITA Wallet'),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: controller.fetchWallet,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildBalanceCard()),
            SliverToBoxAdapter(child: _buildInfoCard()),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Transaction History',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 16)),
                    Obx(() => Text(
                          '${controller.transactions.length} records',
                          style: const TextStyle(
                              color: AppColors.textSecondary, fontSize: 13),
                        )),
                  ],
                ),
              ),
            ),
            Obx(() {
              if (controller.isLoading.value) {
                return const SliverToBoxAdapter(child: LoadingWidget());
              }
              if (controller.transactions.isEmpty) {
                return const SliverToBoxAdapter(
                  child: EmptyWidget(
                    message: 'No transactions yet.',
                    icon: Icons.receipt_outlined,
                  ),
                );
              }
              return SliverList(
                delegate: SliverChildBuilderDelegate(
                  (_, i) => _TxCard(tx: controller.transactions[i]),
                  childCount: controller.transactions.length,
                ),
              );
            }),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceCard() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.primaryLight],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.3),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          children: [
            const Icon(Icons.account_balance_wallet_outlined,
                color: Colors.white70, size: 40),
            const SizedBox(height: 12),
            const Text('Available Balance',
                style: TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Obx(() => Text(
                  '₹${controller.balance.value.toStringAsFixed(2)}',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 38,
                      fontWeight: FontWeight.w800),
                )),
            const SizedBox(height: 4),
            const Text('SITA Store Credit',
                style: TextStyle(color: Colors.white60, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard() => Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider),
          ),
          child: const Column(
            children: [
              _InfoRow(
                icon: Icons.info_outline,
                text: 'SITA Wallet credits are issued by the Foundation as rewards or refunds.',
              ),
              SizedBox(height: 8),
              _InfoRow(
                icon: Icons.shopping_bag_outlined,
                text: 'Use wallet balance to pay for marketplace orders instantly.',
              ),
              SizedBox(height: 8),
              _InfoRow(
                icon: Icons.lock_outline,
                text: 'Credits are non-transferable and valid only within the platform.',
              ),
            ],
          ),
        ),
      );
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primary, size: 16),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 12, height: 1.4)),
          ),
        ],
      );
}

class _TxCard extends StatelessWidget {
  final WalletTransaction tx;
  const _TxCard({required this.tx});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM yyyy, hh:mm a');
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: tx.isCredit
                  ? AppColors.success.withValues(alpha: 0.1)
                  : AppColors.error.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              tx.isCredit ? Icons.arrow_downward : Icons.arrow_upward,
              color: tx.isCredit ? AppColors.success : AppColors.error,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx.description ??
                      tx.reason.replaceAll('_', ' ').split(' ').map((w) =>
                          w[0].toUpperCase() + w.substring(1)).join(' '),
                  style: const TextStyle(
                      fontWeight: FontWeight.w500, fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(fmt.format(tx.createdAt),
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 11)),
                Text('Balance: ₹${tx.balanceAfter.toStringAsFixed(2)}',
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 11)),
              ],
            ),
          ),
          Text(
            '${tx.isCredit ? '+' : '-'}₹${tx.amount.toStringAsFixed(2)}',
            style: TextStyle(
              color: tx.isCredit ? AppColors.success : AppColors.error,
              fontWeight: FontWeight.w700,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }
}
