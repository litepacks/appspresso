import i18n from "@/i18n";

export function changeAppLanguage(lng: string) {
  void i18n.changeLanguage(lng);
}
