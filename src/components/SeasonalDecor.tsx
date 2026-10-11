import styles from './SeasonalDecor.module.css';

type Variant = 'leafPile' | 'sprig' | 'web' | 'pumpkin' | 'scattered';
type Corner = 'bl' | 'br' | 'tl' | 'tr';

export function SeasonalDecor({ variant, corner = 'br', className = '' }: { variant: Variant; corner?: Corner; className?: string }) {
  if (variant === 'web') {
    return <span aria-hidden="true" className={`${styles.decor} ${styles[corner]} ${styles.web} ${className}`} />;
  }
  if (variant === 'pumpkin') {
    return <span aria-hidden="true" className={`${styles.decor} ${styles[corner]} ${styles.pumpkinScene} ${className}`}><i className={styles.pumpkin}/><i className={styles.pumpkinLeaf}/><i className={`${styles.leaf} ${styles.leafA}`}/><i className={`${styles.leaf} ${styles.leafB}`}/></span>;
  }
  if (variant === 'sprig') {
    return <span aria-hidden="true" className={`${styles.decor} ${styles[corner]} ${styles.sprig} ${className}`}><i/><i/><i/><i/><i/></span>;
  }
  if (variant === 'scattered') {
    return <span aria-hidden="true" className={`${styles.decor} ${styles[corner]} ${styles.scattered} ${className}`}><i className={`${styles.leaf} ${styles.leafA}`}/><i className={`${styles.leaf} ${styles.leafB}`}/><i className={`${styles.leaf} ${styles.leafC}`}/></span>;
  }
  return <span aria-hidden="true" className={`${styles.decor} ${styles[corner]} ${styles.pile} ${className}`}><i className={`${styles.leaf} ${styles.leafA}`}/><i className={`${styles.leaf} ${styles.leafB}`}/><i className={`${styles.leaf} ${styles.leafC}`}/><i className={`${styles.leaf} ${styles.leafD}`}/><i className={`${styles.leaf} ${styles.leafE}`}/><i className={`${styles.leaf} ${styles.leafF}`}/></span>;
}
