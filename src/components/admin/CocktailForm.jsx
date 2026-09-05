import { useState } from "react";

const EMPTY_FORM = {
    name: "",
    category: "cocktail",
    tier: "popular",
    country: "",
    detail: "",
    price: "",
    image: "",
    title: "",
    description: "",
    isAvailable: true,
};

const buildFormState = (initialValues) => {
    if (!initialValues) {
        return EMPTY_FORM;
    }

    return {
        name: initialValues.name ?? "",
        category: initialValues.category ?? "cocktail",
        tier: initialValues.tier ?? "popular",
        country: initialValues.country ?? "",
        detail: initialValues.detail ?? "",
        price:
            initialValues.price !== undefined && initialValues.price !== null
                ? String(initialValues.price)
                : "",
        image: initialValues.image ?? "",
        title: initialValues.title ?? "",
        description: initialValues.description ?? "",
        isAvailable:
            initialValues.isAvailable !== undefined
                ? Boolean(initialValues.isAvailable)
                : true,
    };
};

const CocktailForm = ({
                          initialValues,
                          onSubmit,
                          onCancel,
                          isSubmitting = false,
                      }) => {
    const [form, setForm] = useState(() => buildFormState(initialValues));
    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: undefined,
        }));
    };

    const validate = () => {
        const nextErrors = {};

        if (!form.name.trim()) {
            nextErrors.name = "Name is required.";
        }

        if (!["cocktail", "mocktail"].includes(form.category)) {
            nextErrors.category = "Please select a valid category.";
        }

        if (!["popular", "loved"].includes(form.tier)) {
            nextErrors.tier = "Please select a valid tier.";
        }

        if (form.price !== "") {
            const price = Number(form.price);

            if (!Number.isFinite(price)) {
                nextErrors.price = "Price must be a valid number.";
            } else if (price < 0) {
                nextErrors.price = "Price cannot be negative.";
            }
        }

        if (form.image.trim() && !isValidUrl(form.image.trim())) {
            nextErrors.image = "Image must be a valid URL.";
        }

        return nextErrors;
    };

    const isValidUrl = (value) => {
        try {
            const url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload = {
            name: form.name.trim(),
            category: form.category,
            tier: form.tier,
            isAvailable: form.isAvailable,
        };

        if (form.country.trim()) {
            payload.country = form.country.trim();
        }

        if (form.detail.trim()) {
            payload.detail = form.detail.trim();
        }

        if (form.price !== "") {
            payload.price = Number(form.price);
        }

        if (form.image.trim()) {
            payload.image = form.image.trim();
        }

        if (form.title.trim()) {
            payload.title = form.title.trim();
        }

        if (form.description.trim()) {
            payload.description = form.description.trim();
        }

        onSubmit(payload);
    };

    const inputClass =
        "w-full bg-transparent border border-white-100/20 px-3 py-2 text-white-100 outline-none focus:border-yellow transition-colors";

    const labelClass = "block text-sm mb-2 text-white-100/70";

    const errorClass = "mt-1 text-sm text-red-400";

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-8 border border-white-100/10 p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl">
                    {initialValues ? "Edit cocktail" : "Add cocktail"}
                </h2>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="text-sm text-white-100/60 hover:text-white transition-colors disabled:opacity-40"
                >
                    Cancel
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                    <label htmlFor="name" className={labelClass}>
                        Name *
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Mojito"
                        className={inputClass}
                        disabled={isSubmitting}
                    />

                    {errors.name && (
                        <p className={errorClass}>{errors.name}</p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className={labelClass}>
                        Category *
                    </label>

                    <select
                        id="category"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className={inputClass}
                        disabled={isSubmitting}
                    >
                        <option value="cocktail">Cocktail</option>
                        <option value="mocktail">Mocktail</option>
                    </select>

                    {errors.category && (
                        <p className={errorClass}>{errors.category}</p>
                    )}
                </div>

                {/* Tier */}
                <div>
                    <label htmlFor="tier" className={labelClass}>
                        Tier *
                    </label>

                    <select
                        id="tier"
                        name="tier"
                        value={form.tier}
                        onChange={handleChange}
                        className={inputClass}
                        disabled={isSubmitting}
                    >
                        <option value="popular">Popular</option>
                        <option value="loved">Loved</option>
                    </select>

                    {errors.tier && (
                        <p className={errorClass}>{errors.tier}</p>
                    )}
                </div>

                {/* Country */}
                <div>
                    <label htmlFor="country" className={labelClass}>
                        Country
                    </label>

                    <input
                        id="country"
                        name="country"
                        type="text"
                        value={form.country}
                        onChange={handleChange}
                        placeholder="Cuba"
                        className={inputClass}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Price */}
                <div>
                    <label htmlFor="price" className={labelClass}>
                        Price
                    </label>

                    <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="12.50"
                        className={inputClass}
                        disabled={isSubmitting}
                    />

                    {errors.price && (
                        <p className={errorClass}>{errors.price}</p>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label htmlFor="title" className={labelClass}>
                        Display title
                    </label>

                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Fresh & refreshing"
                        className={inputClass}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Image */}
                <div className="md:col-span-2">
                    <label htmlFor="image" className={labelClass}>
                        Image URL
                    </label>

                    <input
                        id="image"
                        name="image"
                        type="url"
                        value={form.image}
                        onChange={handleChange}
                        placeholder="https://example.com/cocktail.jpg"
                        className={inputClass}
                        disabled={isSubmitting}
                    />

                    {errors.image && (
                        <p className={errorClass}>{errors.image}</p>
                    )}
                </div>

                {/* Detail */}
                <div className="md:col-span-2">
                    <label htmlFor="detail" className={labelClass}>
                        Detail
                    </label>

                    <input
                        id="detail"
                        name="detail"
                        type="text"
                        value={form.detail}
                        onChange={handleChange}
                        placeholder="White rum, lime, mint..."
                        className={inputClass}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label htmlFor="description" className={labelClass}>
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe the cocktail..."
                        className={`${inputClass} resize-y`}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Availability */}
                <div className="md:col-span-2">
                    <label className="inline-flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="isAvailable"
                            checked={form.isAvailable}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="h-4 w-4"
                        />

                        <span className="text-sm">
                            Available for customers
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="border border-white-100/20 px-4 py-2 hover:border-white-100/40 transition-colors disabled:opacity-40"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="border border-yellow text-yellow px-4 py-2 hover:bg-yellow hover:text-black transition-colors disabled:opacity-40"
                >
                    {isSubmitting
                        ? "Saving..."
                        : initialValues
                            ? "Update cocktail"
                            : "Create cocktail"}
                </button>
            </div>
        </form>
    );
};

export default CocktailForm;