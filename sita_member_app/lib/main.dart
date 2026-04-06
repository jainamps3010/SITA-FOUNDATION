import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'app/routes/app_pages.dart';
import 'app/routes/app_routes.dart';
import 'app/theme/app_theme.dart';
import 'core/services/api_service.dart';
import 'core/services/storage_service.dart';
import 'modules/cart/cart_controller.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));

  // Register services synchronously — StorageService initializes itself
  // lazily on first use so we never block runApp().
  Get.put(StorageService(), permanent: true);
  Get.put(ApiService(), permanent: true);
  Get.put(CartController(), permanent: true);

  runApp(const SitaMemberApp());
}

class SitaMemberApp extends StatelessWidget {
  const SitaMemberApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'SITA Business Terminal',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: Routes.splash,
      getPages: AppPages.pages,
      defaultTransition: Transition.cupertino,
    );
  }
}
