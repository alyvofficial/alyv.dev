import styles from './Login.module.css';
import { useAuthContext } from '../../providers/AuthProvider';

export const Login = () => {
    const {googleSignIn, logout} = useAuthContext();
return (
    <div className={styles.login}>
        <h2>Login</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta corporis nostrum ipsa esse quos. Accusamus cum consequatur nemo accusantium id, et facilis architecto totam, incidunt voluptatem doloribus temporibus maiores optio omnis, nulla quisquam possimus? Iusto quibusdam debitis ipsum voluptatum minima illo laboriosam repellendus voluptatem! Voluptatibus, quasi cumque maxime natus animi nulla molestias perspiciatis eum voluptatem earum id eius. Ipsam incidunt assumenda voluptas quod amet repudiandae magni cum vel tempore ipsa neque tempora culpa perferendis, unde laboriosam voluptatibus ab officia sunt ad veritatis dolorum qui libero recusandae eaque. Aliquam vel itaque veniam nobis corporis nisi, provident sunt, eligendi dolorem delectus adipisci.</p>
        <button onClick={googleSignIn}>Sign in with Google</button>
        <button onClick={logout}>Logout</button>
    </div>
)
}
