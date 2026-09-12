import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (context === null) {
    throw new Error(
      "useLanguage must be used inside a LanguageProvider"
    );
  }

  return context;
};