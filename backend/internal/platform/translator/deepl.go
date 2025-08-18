package translator

import (
	_ "context"
	"errors"

	"github.com/cluttrdev/deepl-go/deepl"
)

// DeepLTranslator provides translation services using DeepL API.
type DeepLTranslator struct {
	client *deepl.Translator
}

// NewDeepLTranslator creates a new DeepL translator instance.
func NewDeepLTranslator(apiKey string) (*DeepLTranslator, error) {
	if apiKey == "" {
		return nil, errors.New("DeepL API key is required")
	}

	translator, err := deepl.NewTranslator(apiKey)
	if err != nil {
		return nil, err
	}

	return &DeepLTranslator{
		client: translator,
	}, nil
}

// Translate translates text from source language to target language.
func (d *DeepLTranslator) Translate(text, sourceLang, targetLang string) (string, error) {
	if text == "" {
		return "", errors.New("text cannot be empty")
	}

	// Convert language codes to DeepL format if needed
	sourceLangCode := convertToDeepLLangCode(sourceLang)
	targetLangCode := convertToDeepLLangCode(targetLang)

	// Create a source language option if provided
	var opts []deepl.TranslateOption
	if sourceLangCode != "" && sourceLangCode != "auto" {
		opts = append(opts, deepl.WithSourceLang(sourceLangCode))
	}

	result, err := d.client.TranslateText([]string{text}, targetLangCode, opts...)
	if err != nil {
		return "", err
	}

	if len(result) == 0 {
		return "", errors.New("no translation returned")
	}

	return result[0].Text, nil
}

// convertToDeepLLangCode converts common language codes to DeepL format.
func convertToDeepLLangCode(lang string) string {
	// Map common language codes to DeepL format
	langMap := map[string]string{
		"en": "EN",
		"vi": "VI",
		"ja": "JA",
		"ko": "KO",
		"zh": "ZH",
		"fr": "FR",
		"de": "DE",
		"es": "ES",
		"it": "IT",
		"pt": "PT",
		"ru": "RU",
		"pl": "PL",
		"nl": "NL",
		"bg": "BG",
		"cs": "CS",
		"da": "DA",
		"el": "EL",
		"et": "ET",
		"fi": "FI",
		"hu": "HU",
		"id": "ID",
		"lv": "LV",
		"lt": "LT",
		"ro": "RO",
		"sk": "SK",
		"sl": "SL",
		"sv": "SV",
		"tr": "TR",
		"uk": "UK",
	}

	if code, exists := langMap[lang]; exists {
		return code
	}

	// Return uppercase version if no mapping found
	return lang
}
