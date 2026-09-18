export const Card = ({ className, children }) => {
    return (
        <div 
            className={`
                relative overflow-hidden
                bg-white/80 dark:bg-gray-900/80 
                backdrop-blur-xl
                rounded-2xl 
                border border-gray-200/50 dark:border-gray-700/50
                shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50
                hover:shadow-xl hover:shadow-gray-300/50 dark:hover:shadow-gray-800/50
                transition-all duration-300
                p-4 sm:p-5 space-y-4
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ className, children }) => {
    return (
        <div className={`
            flex flex-row items-center gap-2 
            border-b border-gradient-to-r border-gray-200/70 dark:border-gray-700/70
            pb-3
            ${className}
        `}>
            {children}
        </div>
    );
};

export const CardTitle = ({ className, children }) => {
    return (
        <div className={`
            text-base font-semibold pb-1
            bg-gradient-to-r from-gray-900 to-gray-700 
            dark:from-gray-100 dark:to-gray-300
            bg-clip-text text-transparent
            ${className}
        `}>
            {children}
        </div>
    );
};

export const CardContent = ({ className, children }) => {
    return <div className={`${className}`}>{children}</div>;
};

export const CardFooter = ({ className, children }) => {
    return (
        <div
            className={`
                flex flex-row items-center gap-2 
                border-t border-gray-200/70 dark:border-gray-700/70
                pt-4 
                ${className}
            `}
        >
            {children}
        </div>
    );
};
