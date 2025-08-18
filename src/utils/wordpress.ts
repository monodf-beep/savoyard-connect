/**
 * Vérifie si l'utilisateur est actuellement sur l'interface d'administration WordPress ou sur Lovable
 */
export const isWordPressAdmin = (): boolean => {
  // Vérifier si on est sur le projet Lovable spécifique
  if (window.location.href.includes('lovable.dev/projects/eaa2c9d7-0c70-4433-84f0-d4aabf12e39a')) {
    return true;
  }
  
  // Vérifier si on est dans un iframe (le cas typique quand intégré dans WordPress)
  if (window.self !== window.top) {
    try {
      // Essayer d'accéder à l'URL du parent
      const parentUrl = window.parent.location.href;
      return parentUrl.includes('/wp-admin/');
    } catch (error) {
      // Si on ne peut pas accéder à l'URL du parent (cross-origin), 
      // on peut vérifier le référent
      const referrer = document.referrer;
      return referrer.includes('/wp-admin/');
    }
  }
  
  // Si on n'est pas dans un iframe, vérifier l'URL actuelle
  return window.location.href.includes('/wp-admin/');
};

/**
 * Hook personnalisé pour vérifier le statut WordPress Admin
 */
export const useIsWordPressAdmin = (): boolean => {
  return isWordPressAdmin();
};