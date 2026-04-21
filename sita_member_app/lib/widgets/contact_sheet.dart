import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../app/theme/app_theme.dart';

void showContactSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _ContactSheet(),
  );
}

class _ContactSheet extends StatelessWidget {
  const _ContactSheet();

  Future<void> _launch(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Drag handle
              Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 24),

              // Logo
              Container(
                width: 76, height: 76,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.15), width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.12),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Image.asset('assets/logo.png', fit: BoxFit.contain),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Heading
              const Text(
                'Contact Us',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'SITA Foundation — We\'re here to help',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 24),

              // Email
              _ContactTile(
                icon: Icons.email_outlined,
                iconBg: AppColors.primary.withValues(alpha: 0.08),
                iconColor: AppColors.primary,
                label: 'Email',
                value: 'chairman@sita.foundation',
                badge: 'EMAIL',
                badgeColor: AppColors.primary,
                onTap: () => _launch('mailto:chairman@sita.foundation'),
              ),
              const SizedBox(height: 10),

              // Phone 1
              _ContactTile(
                icon: Icons.phone_outlined,
                iconBg: AppColors.success.withValues(alpha: 0.08),
                iconColor: AppColors.success,
                label: 'Phone 1',
                value: '+91 7069924365',
                badge: 'CALL',
                badgeColor: AppColors.success,
                onTap: () => _launch('tel:+917069924365'),
              ),
              const SizedBox(height: 10),

              // Phone 2
              _ContactTile(
                icon: Icons.phone_outlined,
                iconBg: AppColors.success.withValues(alpha: 0.08),
                iconColor: AppColors.success,
                label: 'Phone 2',
                value: '+91 7069824365',
                badge: 'CALL',
                badgeColor: AppColors.success,
                onTap: () => _launch('tel:+917069824365'),
              ),
              const SizedBox(height: 10),

              // WhatsApp
              _ContactTile(
                icon: Icons.chat_outlined,
                iconBg: const Color(0x1A25D366),
                iconColor: const Color(0xFF25D366),
                label: 'WhatsApp',
                value: '+91 7069924365',
                badge: 'CHAT',
                badgeColor: const Color(0xFF25D366),
                onTap: () => _launch('https://wa.me/917069924365'),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}

class _ContactTile extends StatelessWidget {
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final String label;
  final String value;
  final String badge;
  final Color badgeColor;
  final VoidCallback onTap;

  const _ContactTile({
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.badge,
    required this.badgeColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider, width: 0.8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Icon box
            Container(
              width: 46, height: 46,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 22),
            ),
            const SizedBox(width: 14),

            // Text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                      letterSpacing: 0.6,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),

            // Action badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: badgeColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: badgeColor.withValues(alpha: 0.3), width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    badge,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: badgeColor,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(Icons.open_in_new_rounded, color: badgeColor, size: 12),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
