export interface PoSearchLiterals {
  /**
   * @usedBy PoSearchComponent
   *
   * @optional
   *
   * @description
   *
   * search: Texto exibido no *placeholder*  do filtro do componente `po-search`.
   */
  search?: string;

  /**
   * @usedBy PoSearchComponent
   *
   * @optional
   *
   * @description
   *
   * search: Texto usado no leitor de tela para acessibilidade.
   */
  clean?: string;

  /**
   * @usedBy PoSearchComponent
   *
   * @optional
   *
   * @description
   *
   * search: Texto usado no dropdown, para demarcar todos os tipos de filtro.
   */
  all?: string;
}
