# Localization

Application dictionaries live in `src/locales/en.json`, `si.json` and `ta.json`. Their English source keys are shared, nonempty and coverage-tested. Add every new application label to all three dictionaries. The provider and helpers live in `src/i18n.jsx`; components subscribe with `useI18n()` and render `t(key, values)`. `errorText` localizes mapped errors and uses a generic localized failure for unknown server messages. Do not translate API URLs, canonical enum values or user-authored content.

The Language selector uses English / සිංහල / தமிழ். Choice is stored as `language` in localStorage and defaults to English. Language changes re-render components without remounting forms. The document `lang`, date formatting and number formatting follow the selected locale. Parameterized photo descriptions preserve user titles and numeric arguments. Email request payloads include the selected locale; backend templates independently support en/si/ta.

Operator catalogue IDs remain canonical. Bundled placeholder labels have translations, while custom districts/towns/category IDs need reviewed dictionary entries or appropriately localized operator labels. The frontend never invents translations of listing titles, descriptions, bios, messages or moderation notes.

Verification/recovery tokens are read once from route fragments, removed from the visible URL and kept only in component state until an explicit submission. The app requests no-referrer behavior. No token is stored in browser storage. Notifications use recipient-only APIs and safe server-generated internal destinations. Real SMTP settings belong only in backend environment settings, never VITE_* variables.

Run `npm test` and `npm run build` after editing copy. Tests cover complete dictionary key sets, Sinhala/Tamil rendering, persisted preference, state preservation, canonical condition/sort values, account confirmation/recovery payloads and notification read state. Keep localization review part of each feature change.

v2.8 adds order dispute/refund states, buyer/seller forms, administrator queue/decisions, shared resolution labels and known API errors in en/si/ta. Test refund labels explicitly state that no real money is returned. Buyer reasons, seller responses and shared resolutions remain user-authored plain text and are never automatically translated. Review this copy with native speakers alongside the existing translation review before launch.
