import styles from './SeasonalDecor.module.css';

type Variant = 'leafPile' | 'sprig' | 'web' | 'pumpkin' | 'scattered' | 'ghost';
type Corner = 'bl' | 'br' | 'tl' | 'tr';

export function SeasonalDecor({ variant, corner = 'br', className = '' }: { variant: Variant; corner?: Corner; className?: string }) {
  if (variant === 'web') return <span aria-hidden="true" data-seasonal="web" data-corner={corner} className={`${styles.decor} ${styles[corner]} ${styles.web} ${className}`}><i/><i/><i/></span>;
  if (variant === 'pumpkin') return <span aria-hidden="true" data-seasonal="pumpkin" data-corner={corner} className={`${styles.decor} ${styles[corner]} ${styles.pumpkinScene} ${className}`}><i className={styles.pumpkin}/><i className={styles.miniPumpkin}/><i className={styles.vine}/></span>;
  if (variant === 'sprig') return <span aria-hidden="true" data-seasonal="bats" data-corner={corner} className={`${styles.decor} ${styles[corner]} ${styles.bats} ${className}`}><i/><i/><i/></span>;
  if (variant === 'ghost') return <span aria-hidden="true" data-seasonal="ghost" data-corner={corner} className={`${styles.decor} ${styles[corner]} ${styles.ghostScene} ${className}`}><i className={styles.ghost}/><i className={styles.ghostMini}/></span>;
  if (variant === 'scattered') return <span aria-hidden="true" data-seasonal="crows" data-corner={corner} className={`${styles.decor} ${styles[corner]} ${styles.crows} ${className}`}><i/><i/></span>;
  return <span aria-hidden="true" data-seasonal="leaves" data-corner={corner} className={`${styles.decor} ${styles[corner]} ${styles.leafPile} ${className}`}><i/><i/><i/><i/><i/><i/><i/></span>;
}
