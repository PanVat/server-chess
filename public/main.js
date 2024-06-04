/* Čekání, než se naplní DOM ještě před zpracováním kódu */
document.addEventListener('DOMContentLoaded', () => {
    let deska = null; /* Inicializace hrací desky */
    const hra = new Chess(); /* Vytvoření instance nové šachové hry */
    const historieTahu = document.getElementById('historie-tahu'); /* Získání kontejneru s historií tahů */
    let pocetTahu = 1; /* Inicializace počtu tahů */
    let barvaUzivatele = 'w'; /* Inicializace uživatelské barvy na bílou */

    /* Funkce, která udělá náhodný tah za počítač */
    const udelejNahodnyTah = () => {
        const mozneTahy = hra.moves();

        if (hra.game_over()) {
            alert("Šach Mat!");
        } else {
            const nahodnyIdx = Math.floor(Math.random() * mozneTahy.length);
            const tah = mozneTahy[nahodnyIdx];
            hra.move(tah);
            deska.position(hra.fen());
            nahrajTah(tah, pocetTahu); /* Nahrát a zobrazit tah s počtem tahů */
            pocetTahu++; /* Zvýšit počet tahů */
        }
    };
    /* Funkce pro nahrání a zobrazení tahu v historii tahů */
    const nahrajTah = (tah, pocet) => {
        const formatovanyTah = pocet % 2 === 1 ? `${Math.ceil(pocet / 2)}. ${tah}` : `${tah} -`;
        historieTahu.textContent += formatovanyTah + ' ';
        historieTahu.scrollTop = historieTahu.scrollHeight; /* Automaticky přetočit na poslední tah */
    };
    /* Funkce pro řízení uchopení figurky */
    const naZacatkuTahu = (zdroj, dilek) => {
        /* Uživatel může pohybovat pouze figurkami na základě své barvy */
        return !hra.game_over() && dilek.search(barvaUzivatele) === 0;
    };
    /* Funkce pro řízení upuštění figurky */
    const priPolozeni = (zdroj, cil) => {
        const tah = hra.move({
            from: zdroj,
            to: cil,
            promotion: 'q',
        });
        if (tah === null) return 'snapback';

        window.setTimeout(udelejNahodnyTah, 250);
        nahrajTah(tah.san, pocetTahu); /* Nahraj a zobraz tah i s počtem tahů */
        pocetTahu++;
    };
    /* Funkce pro zpracování konce animace uchopení figurky */
    const naKonciUchopeni = () => {
        deska.position(hra.fen());
    };
    /* Nastavení pro konfiguraci hrací plochy */
    const konfiguraceDesky = {
        showNation: true,
        draggable: true,
        position: 'start',
        naZacatkuTahu,
        priPolozeni,
        naKonciUchopeni,
        moveSpeed: 'fast',
        snapBackSpeed: 500,
        snapSpeed: 100,
    };
    /* Inicializace hrací plochy */
    deska = Chessboard('deska', konfiguraceDesky);

    /* Event listener pro tlačítko "Nová hra" */
    document.querySelector(('.nova-hra')).addEventListener
        ('click', () => {
            hra.reset();
            deska.start();
            historieTahu.textContent = '';
            pocetTahu = 1;
            barvaUzivatele = 'w';
        });
    /* Event listener pro tlačítko "Překlopit desku" */
    document.querySelector('.preklopit-desku').addEventListener
        ('click', () => {
            deska.flip();
            udelejNahodnyTah();
            /* Přepnutí barvy uživatele po převrácení desky */
            barvaUzivatele = barvaUzivatele === 'w' ? 'b' : 'w';
        });
});