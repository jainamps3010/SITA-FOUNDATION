class WalletTransaction {
  final String id;
  final String type;
  final double amount;
  final double balanceAfter;
  final String reason;
  final String? description;
  final DateTime createdAt;

  WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.balanceAfter,
    required this.reason,
    this.description,
    required this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) => WalletTransaction(
        id: json['id'] ?? '',
        type: json['type'] ?? 'credit',
        amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
        balanceAfter: double.tryParse(json['balance_after']?.toString() ?? '0') ?? 0.0,
        reason: json['reason'] ?? '',
        description: json['description'],
        createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      );

  bool get isCredit => type == 'credit';
}
