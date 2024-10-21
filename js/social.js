var socialNameSpace = (function () {
  const text = {
    EN: "By using the Energy Monthly tool, created by Eurostat, you can easily visualise early trends of the main energy flows and get important information on the evolution of the energy market in the last months.",
    FR: "En utilisant l'outil Energy Monthly, créé par Eurostat, vous pouvez facilement visualiser les tendances précoces des principaux flux énergétiques et obtenir des informations importantes sur l'évolution du marché de l'énergie au cours des derniers mois.",
    DE: "Mit dem Energy Monthly-Tool, das von Eurostat erstellt wurde, können Sie frühzeitig die Hauptenergieflüsse visualisieren und wichtige Informationen über die Entwicklung des Energiemarktes in den letzten Monaten erhalten."
    };

  const currentUrl = encodeURIComponent(window.location.href);
  const language = (REF.language || 'EN').toUpperCase(); // Default to English and ensure uppercase

  function openWindow(url, height = 450, width = 650) {
    window.open(url, "", `menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=${height},width=${width}`);
  }

  return {
    linkedin: function () {
      const description = encodeURIComponent(text[language]);
      const url = `https://www.linkedin.com/shareArticle?mini=true&title=Energyprices&summary=${description}&url=${currentUrl}`;
      openWindow(url);
      return false;
    },

    twitter: function () {
      const textContent = encodeURIComponent(text[language]);
      const url = `https://twitter.com/share?text=${textContent}&url=${currentUrl}`;
      openWindow(url, 400, 700);
      return false;
    },

    facebook: function () {
      const description = encodeURIComponent(text[language]);
      const url = `https://www.facebook.com/sharer.php?u=${currentUrl}&quote=${description}`;
      openWindow(url, 500, 700);
      return false;
    },

    email: function () {
      const subject = encodeURIComponent("Energy monthly");
      const body = encodeURIComponent(`${text[language]} ${window.location.href}`);
      document.location = `mailto:ESTAT-ENERGY@ec.europa.eu?subject=${subject}&body=${body}`;
    },
  };
})();