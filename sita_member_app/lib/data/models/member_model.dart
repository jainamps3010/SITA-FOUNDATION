class Member {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String? hotelName;
  final String? hotelAddress;
  final String? city;
  final String? state;
  final String? pincode;
  final String? gstin;
  final String status;
  final bool membershipPaid;
  final double walletBalance;
  final DateTime? createdAt;
  // Annual membership fields
  final String membershipStatus; // active | expired | cancelled | pending
  final DateTime? membershipStartDate;
  final DateTime? membershipExpiryDate;

  Member({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.hotelName,
    this.hotelAddress,
    this.city,
    this.state,
    this.pincode,
    this.gstin,
    required this.status,
    required this.membershipPaid,
    required this.walletBalance,
    this.createdAt,
    this.membershipStatus = 'pending',
    this.membershipStartDate,
    this.membershipExpiryDate,
  });

  factory Member.fromJson(Map<String, dynamic> json) => Member(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        phone: json['phone'] ?? '',
        email: json['email'],
        hotelName: json['hotel_name'],
        hotelAddress: json['hotel_address'],
        city: json['city'],
        state: json['state'],
        pincode: json['pincode'],
        gstin: json['gstin'],
        status: json['status'] ?? 'pending',
        membershipPaid: json['membership_paid'] ?? false,
        walletBalance: double.tryParse(json['sita_wallet_balance']?.toString() ?? '0') ?? 0.0,
        createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
        membershipStatus: json['membership_status'] ?? 'pending',
        membershipStartDate: json['membership_start_date'] != null
            ? DateTime.tryParse(json['membership_start_date'])
            : null,
        membershipExpiryDate: json['membership_expiry_date'] != null
            ? DateTime.tryParse(json['membership_expiry_date'])
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'phone': phone,
        'email': email,
        'hotel_name': hotelName,
        'hotel_address': hotelAddress,
        'city': city,
        'state': state,
        'pincode': pincode,
        'gstin': gstin,
        'status': status,
        'membership_paid': membershipPaid,
        'sita_wallet_balance': walletBalance,
        'membership_status': membershipStatus,
        'membership_start_date': membershipStartDate?.toIso8601String().split('T')[0],
        'membership_expiry_date': membershipExpiryDate?.toIso8601String().split('T')[0],
      };

  bool get isApproved => status == 'approved';
  bool get isPending => status == 'pending';
  bool get isActive => status == 'active';

  bool get isMembershipActive => membershipStatus == 'active';
  bool get isMembershipExpired => membershipStatus == 'expired';

  /// Days until expiry. Negative if already expired.
  int get daysUntilExpiry {
    if (membershipExpiryDate == null) return -1;
    return membershipExpiryDate!.difference(DateTime.now()).inDays;
  }

  /// True if expiry is within 30 days (and not yet expired).
  bool get isExpiringSoon => isMembershipActive && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

  bool get canOrder =>
      (status == 'approved' || status == 'active') &&
      membershipPaid &&
      membershipStatus == 'active';
}
