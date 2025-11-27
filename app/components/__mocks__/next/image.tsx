// __mocks__/next/image.tsx
const Image = ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />;
export default Image;