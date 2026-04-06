import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../core/services/storage_service.dart';
import '../../data/models/member_model.dart';
import '../../app/routes/app_routes.dart';

class HomeController extends GetxController {
  final member = Rxn<Member>();
  final isLoading = false.obs;
  final currentIndex = 0.obs;

  @override
  void onInit() {
    super.onInit();
    _loadFromStorage();
    fetchProfile();
  }

  void _loadFromStorage() {
    final data = StorageService.to.member;
    if (data != null) member.value = Member.fromJson(data);
  }

  Future<void> fetchProfile() async {
    try {
      final res = await Get.find<ApiService>().get('/members/profile');
      final m = Member.fromJson(res['member'] as Map<String, dynamic>);
      member.value = m;
      await StorageService.to.saveMember(m.toJson());
    } catch (_) {}
  }

  void logout() {
    StorageService.to.clearAll();
    Get.offAllNamed(Routes.login);
  }
}
