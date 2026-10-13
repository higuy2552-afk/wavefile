/**
 * Inspection helpers driven by the URL.
 *   ?act=file|gate|msg|reveal  jump straight into one act
 *   ?hold=1                    play the act but never auto-leave it
 *   ?theme=bio|void            start on a specific dossier theme
 *   ?hud=1                     open the control deck on load
 */
const params = new URLSearchParams(window.location.search);

export const WANTED_ACT = (params.get('act') || '').toLowerCase();
export const HOLD = params.has('hold');
export const WANT_HUD = params.has('hud');
export const WANT_THEME = (params.get('theme') || '').toLowerCase();
