import React, { forwardRef } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "@/src/libs/utils";

interface CheckboxProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    label?: string;
    labelPosition?: 'right' | 'left';
    className?: string;
    containerClassName?: string;
    checkboxClassName?: string;
    labelClassName?: string;
    checkColor?: string;
    size?: number;
    children?: React.ReactNode;
}

const Checkbox = forwardRef<React.ElementRef<typeof TouchableOpacity>, CheckboxProps>(
    ({
        checked = false,
        onCheckedChange,
        disabled = false,
        label,
        labelPosition = 'right',
        className,
        containerClassName,
        checkboxClassName,
        labelClassName,
        checkColor = "white",
        size = 20,
        children,
        ...props
    }, ref) => {

        const handlePress = () => {
            if (!disabled && onCheckedChange) {
                onCheckedChange(!checked);
            }
        };

        const renderLabel = () => {
            if (!label && !children) return null;

            return (
                <Text
                    className={cn(
                        "mx-2 text-base text-gray-700",
                        disabled && "text-gray-400 opacity-80",
                        labelClassName
                    )}
                    onPress={handlePress}
                >
                    {label || children}
                </Text>
            );
        };

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                className={cn(
                    "flex-row items-center my-1.5",
                    containerClassName,
                    className
                )}
                onPress={handlePress}
                disabled={disabled}
                accessibilityRole="checkbox"
                accessibilityState={{ checked, disabled }}
                ref={ref}
                {...props}
            >
                {labelPosition === 'left' && renderLabel()}

                <View
                    className={cn(
                        "justify-center items-center border-2 rounded",
                        checked ? "bg-primary border-primary" : "border-gray-300 bg-transparent",
                        disabled && "opacity-50",
                        checkboxClassName
                    )}
                    style={{
                        width: size,
                        height: size,
                    }}
                >
                    {checked && (
                        <Check
                            size={size * 0.7}
                            color={checkColor}
                            strokeWidth={3}
                        />
                    )}
                </View>

                {labelPosition === 'right' && renderLabel()}
            </TouchableOpacity>
        );
    }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };