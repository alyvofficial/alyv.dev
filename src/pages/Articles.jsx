import styles from './Articles.module.css';
import { useAuthContext } from '../providers/AuthProvider';

export const Articles = () => {
  const {user, firestore } = useAuthContext();

    if (!user) {
    console.log('User not signed in');
  } else{
    console.log('User signed in');
  }
  return (
    <section className={styles.articlesSection}>
        <div className={styles.articlesContainer}>
            
        </div>
    </section>
  )
}
