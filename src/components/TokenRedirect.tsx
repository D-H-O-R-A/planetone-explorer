
import { useParams, Navigate } from 'react-router-dom';

const TokenRedirect = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/asset/${id}`} replace />;
};

export default TokenRedirect;
