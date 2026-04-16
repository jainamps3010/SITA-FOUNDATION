import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../app/theme/app_theme.dart';
import 'register_controller.dart';

class RegisterView extends GetView<RegisterController> {
  const RegisterView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Register as Member'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Info banner ──────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.07),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: AppColors.primary, size: 18),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Registration is subject to SITA Foundation approval. Upload clear photos of documents for faster verification.',
                      style: TextStyle(color: AppColors.primary, fontSize: 12.5, height: 1.5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ── Section 1: Personal Information ─────────────────────────
            _section(
              icon: Icons.person_outline,
              title: 'Personal Information',
              color: const Color(0xFF1565C0),
              children: [
                _label('Full Name *'),
                _field(controller.nameCtrl, 'Your full name'),
                _label('Mobile Number *'),
                TextField(
                  controller: controller.phoneCtrl,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: const InputDecoration(
                    hintText: '10-digit mobile number',
                    prefixText: '+91  ',
                    counterText: '',
                  ),
                ),
                _label('Email Address'),
                _field(controller.emailCtrl, 'email@example.com',
                    type: TextInputType.emailAddress),
              ],
            ),

            // ── Section 2: Business Details ──────────────────────────────
            _section(
              icon: Icons.storefront_outlined,
              title: 'Business Details',
              color: const Color(0xFF2E7D32),
              children: [
                _label('Business Name *'),
                _field(controller.businessCtrl, 'Restaurant / Hotel name'),
                _label('Business Category *'),
                Obx(() => DropdownButtonFormField<BusinessCategory>(
                      value: controller.selectedCategory.value,
                      decoration: const InputDecoration(hintText: 'Select category…'),
                      items: kCategories
                          .map((c) => DropdownMenuItem(
                                value: c,
                                child: Row(
                                  children: [
                                    Container(
                                      width: 10,
                                      height: 10,
                                      decoration: BoxDecoration(
                                        color: c.color,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(c.label, style: const TextStyle(fontSize: 14)),
                                  ],
                                ),
                              ))
                          .toList(),
                      onChanged: (v) => controller.selectedCategory.value = v,
                    )),
                _label('GST Number *'),
                TextField(
                  controller: controller.gstCtrl,
                  textCapitalization: TextCapitalization.characters,
                  maxLength: 15,
                  decoration: const InputDecoration(
                    hintText: '15-digit GSTIN',
                    counterText: '',
                  ),
                ),
              ],
            ),

            // ── Section 3: Address ────────────────────────────────────────
            _section(
              icon: Icons.location_on_outlined,
              title: 'Business Address',
              color: const Color(0xFFE65100),
              children: [
                _label('Street Address *'),
                _field(controller.addressCtrl, 'Full address', maxLines: 2),
                _label('City *'),
                _field(controller.cityCtrl, 'City'),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _label('State *'),
                          _field(controller.stateCtrl, 'State'),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _label('Pincode'),
                          TextField(
                            controller: controller.pincodeCtrl,
                            keyboardType: TextInputType.number,
                            maxLength: 6,
                            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                            decoration: const InputDecoration(
                                hintText: '6-digit pincode', counterText: ''),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                _label('District (auto-filled from GPS)'),
                _field(controller.districtCtrl, 'District'),
              ],
            ),

            // ── Section 4: Documents ──────────────────────────────────────
            _section(
              icon: Icons.description_outlined,
              title: 'Documents',
              color: const Color(0xFF6A1B9A),
              children: [
                _label('Business Registration Certificate *'),
                Obx(() => _docPickerButton(
                      label: 'Upload Certificate',
                      file: controller.businessRegCert.value,
                      onTap: () => controller.pickImage(controller.businessRegCert),
                    )),
                const SizedBox(height: 4),
                _label('FSSAI License *'),
                Obx(() => _docPickerButton(
                      label: 'Upload FSSAI License',
                      file: controller.fssaiLicense.value,
                      onTap: () => controller.pickImage(controller.fssaiLicense),
                    )),
              ],
            ),

            // ── Section 5: Establishment Photos ──────────────────────────
            _section(
              icon: Icons.photo_camera_outlined,
              title: 'Establishment Photos',
              color: const Color(0xFF00695C),
              children: [
                const Text(
                  'Upload clear photos of your establishment for verification.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12.5),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Obx(() => _photoTile(
                            label: 'Front View *',
                            icon: Icons.storefront,
                            file: controller.frontPhoto.value,
                            onTap: () => controller.pickImage(controller.frontPhoto),
                          )),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Obx(() => _photoTile(
                            label: 'Billing Counter *',
                            icon: Icons.point_of_sale,
                            file: controller.billingPhoto.value,
                            onTap: () => controller.pickImage(controller.billingPhoto),
                          )),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: Obx(() => _photoTile(
                            label: 'Kitchen *',
                            icon: Icons.kitchen,
                            file: controller.kitchenPhoto.value,
                            onTap: () => controller.pickImage(controller.kitchenPhoto),
                          )),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Obx(() => _photoTile(
                            label: 'Menu Card *',
                            icon: Icons.menu_book,
                            file: controller.menuCardPhoto.value,
                            onTap: () => controller.pickImage(controller.menuCardPhoto),
                          )),
                    ),
                  ],
                ),
              ],
            ),

            // ── Section 6: GPS Location ───────────────────────────────────
            _section(
              icon: Icons.gps_fixed,
              title: 'GPS Location',
              color: const Color(0xFF37474F),
              children: [
                const Text(
                  'Your GPS coordinates help us verify your location and enable delivery services.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12.5),
                ),
                const SizedBox(height: 12),
                Obx(() {
                  final captured = controller.latitude.value != null;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      OutlinedButton.icon(
                        onPressed: controller.isLocating.value
                            ? null
                            : controller.detectLocation,
                        icon: controller.isLocating.value
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Icon(captured ? Icons.gps_fixed : Icons.gps_not_fixed,
                                color: captured
                                    ? AppColors.success
                                    : AppColors.primary),
                        label: Text(
                          captured ? 'Location Captured — Tap to Refresh' : 'Detect My Location',
                          style: TextStyle(
                            color: captured ? AppColors.success : AppColors.primary,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(
                            color: captured ? AppColors.success : AppColors.primary,
                          ),
                          minimumSize: const Size(double.infinity, 48),
                        ),
                      ),
                      if (controller.locationStatus.value.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          controller.locationStatus.value,
                          style: TextStyle(
                            fontSize: 12.5,
                            color: captured ? AppColors.success : AppColors.textSecondary,
                          ),
                        ),
                      ],
                      if (captured) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.success.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                                color: AppColors.success.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            '📍 ${controller.latitude.value!.toStringAsFixed(5)}, '
                            '${controller.longitude.value!.toStringAsFixed(5)}',
                            style: const TextStyle(
                                fontSize: 12.5, color: AppColors.success),
                          ),
                        ),
                      ],
                    ],
                  );
                }),
              ],
            ),

            const SizedBox(height: 24),

            // ── Submit button ─────────────────────────────────────────────
            Obx(() => ElevatedButton(
                  onPressed: controller.isLoading.value ? null : controller.register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.secondary,
                    minimumSize: const Size(double.infinity, 54),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: controller.isLoading.value
                      ? const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2.5),
                            ),
                            SizedBox(width: 12),
                            Text('Submitting Application…',
                                style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white)),
                          ],
                        )
                      : const Text('Submit Application',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: Colors.white)),
                )),
            const SizedBox(height: 8),
            Center(
              child: TextButton(
                onPressed: () => Get.back(),
                child: const Text('Already registered? Login',
                    style: TextStyle(color: AppColors.primary)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Section card ─────────────────────────────────────────────────────────────
  Widget _section({
    required IconData icon,
    required String title,
    required Color color,
    required List<Widget> children,
  }) =>
      Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.divider),
          boxShadow: const [
            BoxShadow(color: Color(0x08000000), blurRadius: 8, offset: Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.08),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
                border: Border(
                    bottom: BorderSide(color: color.withValues(alpha: 0.15))),
              ),
              child: Row(
                children: [
                  Icon(icon, color: color, size: 18),
                  const SizedBox(width: 8),
                  Text(title,
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                          color: color)),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: children,
              ),
            ),
          ],
        ),
      );

  // ── Document picker button ────────────────────────────────────────────────
  Widget _docPickerButton({
    required String label,
    required XFile? file,
    required VoidCallback onTap,
  }) {
    final picked = file != null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: picked
              ? AppColors.success.withValues(alpha: 0.06)
              : AppColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: picked
                ? AppColors.success.withValues(alpha: 0.4)
                : AppColors.divider,
            style: picked ? BorderStyle.solid : BorderStyle.solid,
          ),
        ),
        child: Row(
          children: [
            Icon(
              picked ? Icons.check_circle : Icons.upload_file,
              color: picked ? AppColors.success : AppColors.textSecondary,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                picked ? file!.name : label,
                style: TextStyle(
                  fontSize: 13.5,
                  color: picked ? AppColors.success : AppColors.textSecondary,
                  fontWeight: picked ? FontWeight.w600 : FontWeight.normal,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (picked)
              const Icon(Icons.edit_outlined,
                  color: AppColors.textSecondary, size: 16),
          ],
        ),
      ),
    );
  }

  // ── Photo tile ───────────────────────────────────────────────────────────
  Widget _photoTile({
    required String label,
    required IconData icon,
    required XFile? file,
    required VoidCallback onTap,
  }) {
    final picked = file != null;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 110,
        decoration: BoxDecoration(
          color: picked ? null : AppColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: picked
                ? AppColors.success.withValues(alpha: 0.5)
                : AppColors.divider,
            width: picked ? 1.5 : 1.0,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: picked
            ? Stack(
                fit: StackFit.expand,
                children: [
                  Image.file(File(file!.path), fit: BoxFit.cover),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check,
                          color: Colors.white, size: 12),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      color: Colors.black54,
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Text(
                        label.replaceAll(' *', ''),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ],
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(icon, color: AppColors.textSecondary, size: 28),
                  const SizedBox(height: 6),
                  Text(
                    label,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        height: 1.3),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(top: 14, bottom: 6),
        child: Text(text,
            style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: AppColors.textPrimary)),
      );

  Widget _field(
    TextEditingController ctrl,
    String hint, {
    TextInputType type = TextInputType.text,
    int maxLines = 1,
  }) =>
      TextField(
        controller: ctrl,
        keyboardType: type,
        maxLines: maxLines,
        decoration: InputDecoration(hintText: hint),
      );
}
