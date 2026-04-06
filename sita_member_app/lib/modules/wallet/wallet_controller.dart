import 'package:get/get.dart';
import '../../core/services/api_service.dart';
import '../../data/models/wallet_model.dart';

class WalletController extends GetxController {
  final transactions = <WalletTransaction>[].obs;
  final balance = 0.0.obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchWallet();
  }

  Future<void> fetchWallet() async {
    isLoading.value = true;
    try {
      final res = await Get.find<ApiService>().get('/members/wallet?limit=50');
      balance.value = (res['balance'] as num?)?.toDouble() ?? 0.0;
      transactions.value = (res['data'] as List<dynamic>? ?? [])
          .map((e) => WalletTransaction.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }
}
