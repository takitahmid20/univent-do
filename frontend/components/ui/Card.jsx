import { twMerge } from 'tailwind-merge';

export function Card({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={twMerge(
        "bg-white rounded-xl shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={twMerge("p-4 border-b", className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={twMerge("p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={twMerge("p-4 border-t", className)}
      {...props}
    >
      {children}
    </div>
  );
};