import { useLanguage } from '../providers/LanguageProvider';

export const Changer = () => {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 pb-3">
            <span
                onClick={() => changeLanguage("az")}
                className={`cursor-pointer text-xs font-bold ${language === "az" ? "text-white" : "text-gray-500"}`}
            >
                AZ
            </span>
            <span className="text-gray-500">/</span>
            <span
                onClick={() => changeLanguage("en")}
                className={`cursor-pointer text-xs font-bold ${language === "en" ? "text-white" : "text-gray-500"}`}
            >
                EN
            </span>
        </div>
    );
};
