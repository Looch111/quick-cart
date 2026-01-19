'use client'
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { Plus, Trash2, UploadCloud, Download, Upload } from "lucide-react";
import Papa from 'papaparse';

const SingleProductUpload = () => {
    const { addProduct, isAdmin } = useAppContext()

    const [images, setImages] = useState(Array(4).fill(null));
    const [imagePreviews, setImagePreviews] = useState(Array(4).fill(null));
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Earphone');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [flashSalePrice, setFlashSalePrice] = useState('');
    const [sizes, setSizes] = useState([{ size: '', stock: '' }]);
    const [flashSaleEndDate, setFlashSaleEndDate] = useState('');
    const [hasSizes, setHasSizes] = useState(false);
    const [totalStock, setTotalStock] = useState('');
    const [deliveryInfo, setDeliveryInfo] = useState('');

    const handleImageChange = (index, file) => {
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("File is too large. Max size is 5MB.");
                return;
            }
            const newImages = [...images];
            newImages[index] = file;
            setImages(newImages);

            const newPreviews = [...imagePreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setImagePreviews(newPreviews);
        }
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages[index] = null;
        setImages(newImages);

        const newPreviews = [...imagePreviews];
        if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
            URL.revokeObjectURL(newPreviews[index]);
        }
        newPreviews[index] = null;
        setImagePreviews(newPreviews);
    }

    const handleSizeChange = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = value;
        setSizes(newSizes);
    };

    const addSizeField = () => {
        setSizes([...sizes, { size: '', stock: '' }]);
    };

    const removeSizeField = (index) => {
        const newSizes = sizes.filter((_, i) => i !== index);
        setSizes(newSizes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(price) > 0 && Number(price) <= Number(offerPrice)) {
            toast.error("The Original Price must be higher than the Selling Price to show a discount.");
            return;
        }

        let productSizes = {};
        let stock = 0;

        if (hasSizes) {
            sizes.forEach(s => {
                if (s.size && s.stock) {
                    productSizes[s.size.trim()] = Number(s.stock);
                    stock += Number(s.stock);
                }
            });
            if (Object.keys(productSizes).length === 0) {
                toast.error("Please add at least one size with stock.");
                return;
            }
        } else {
            stock = Number(totalStock);
            if (stock <= 0) {
                toast.error("Please enter a valid stock quantity.");
                return;
            }
        }

        if (flashSaleEndDate && (!flashSalePrice || Number(flashSalePrice) <= 0)) {
            toast.error("Please set a Flash Sale Price if you set a Flash Sale End Date.");
            return;
        }

        const imageFiles = images.filter(img => img !== null);

        if (imageFiles.length === 0) {
            toast.error("Please provide at least one image.");
            return;
        }

        const productData = {
            name,
            brand,
            color,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            flashSalePrice: Number(flashSalePrice) || null,
            image: imageFiles,
            stock: stock,
            sizes: productSizes,
            flashSaleEndDate: flashSaleEndDate || null,
            deliveryInfo: deliveryInfo,
            reviewCount: 0,
            averageRating: 0
        }

        await addProduct(productData);

        // Reset form
        setImages(Array(4).fill(null));
        setImagePreviews(Array(4).fill(null));
        setName('');
        setBrand('');
        setColor('');
        setDescription('');
        setCategory('Earphone');
        setPrice('');
        setOfferPrice('');
        setFlashSalePrice('');
        setSizes([{ size: '', stock: '' }]);
        setTotalStock('');
        setFlashSaleEndDate('');
        setHasSizes(false);
        setDeliveryInfo('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
            <div>
                <p className="text-base font-medium">Upload Product Images</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="relative aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
                            {imagePreviews[index] ? (
                                <>
                                    <Image
                                        src={imagePreviews[index]}
                                        alt={`Preview ${index + 1}`}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                    <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full z-10">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </>
                            ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                                    <UploadCloud className="w-8 h-8" />
                                    <span className="text-xs mt-2 text-center">Click to upload</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif"
                                        onChange={(e) => handleImageChange(index, e.target.files[0])}
                                    />
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-1 max-w-md">
                <label className="text-base font-medium" htmlFor="product-name">
                    Product Name
                </label>
                <input
                    id="product-name"
                    type="text"
                    placeholder="Type here"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    required
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="product-brand">
                        Brand <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        id="product-brand"
                        type="text"
                        placeholder="e.g., Sony"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                        onChange={(e) => setBrand(e.target.value)}
                        value={brand}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="product-color">
                        Color <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        id="product-color"
                        type="text"
                        placeholder="e.g., Midnight Black"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                        onChange={(e) => setColor(e.target.value)}
                        value={color}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1 max-w-md">
                <label
                    className="text-base font-medium"
                    htmlFor="product-description"
                >
                    Product Description
                </label>
                <textarea
                    id="product-description"
                    rows={4}
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300 resize-none"
                    placeholder="Type here"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    required
                ></textarea>
            </div>
            <div className="flex flex-col gap-1 max-w-md">
                <label className="text-base font-medium" htmlFor="delivery-info">
                    Delivery Information
                </label>
                <input
                    id="delivery-info"
                    type="text"
                    placeholder="e.g., 2-3 business days"
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                    onChange={(e) => setDeliveryInfo(e.target.value)}
                    value={deliveryInfo}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pricing */}
                <div className='space-y-4 border p-4 rounded-md'>
                    <h3 className='font-semibold text-lg'>Pricing</h3>
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-base font-medium" htmlFor="product-price">
                            Original Price <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            id="product-price"
                            type="number"
                            placeholder="e.g., 100"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-base font-medium" htmlFor="offer-price">
                            Selling Price
                        </label>
                        <input
                            id="offer-price"
                            type="number"
                            placeholder="e.g., 80"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                            onChange={(e) => setOfferPrice(e.target.value)}
                            value={offerPrice}
                            required
                        />
                    </div>
                </div>

                {/* Flash Sale Pricing */}
                <div className='space-y-4 border p-4 rounded-md'>
                    <h3 className='font-semibold text-lg'>Flash Sale (Optional)</h3>
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-base font-medium" htmlFor="flash-sale-price">
                            Flash Sale Price
                        </label>
                        <input
                            id="flash-sale-price"
                            type="number"
                            placeholder="0"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                            onChange={(e) => setFlashSalePrice(e.target.value)}
                            value={flashSalePrice}
                        />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-base font-medium" htmlFor="flash-sale-date">
                            Flash Sale End Date
                        </label>
                        <input
                            id="flash-sale-date"
                            type="datetime-local"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                            onChange={(e) => setFlashSaleEndDate(e.target.value)}
                            value={flashSaleEndDate}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-md">
                <div className="flex flex-col gap-1 mb-4">
                    <label className="text-base font-medium" htmlFor="category">
                        Category
                    </label>
                    <select
                        id="category"
                        className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                        onChange={(e) => setCategory(e.target.value)}
                        value={category}
                    >
                        <option value="Earphone">Earphone</option>
                        <option value="Headphone">Headphone</option>
                        <option value="Watch">Watch</option>
                        <option value="Smartphone">Smartphone</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Camera">Camera</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Clothes">Clothes</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Drones">Drones</option>
                        <option value="Smart Home">Smart Home</option>
                        <option value="TV & Audio">TV & Audio</option>
                    </select>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <input type="checkbox" id="has-sizes" checked={hasSizes} onChange={(e) => setHasSizes(e.target.checked)} className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500" />
                    <label htmlFor="has-sizes" className="text-base font-medium">This product has multiple sizes</label>
                </div>

                {hasSizes ? (
                    <div className="space-y-2 border p-4 rounded-md">
                        <label className="text-base font-medium">Sizes & Stock</label>
                        {sizes.map((s, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Size (e.g., M)"
                                    value={s.size}
                                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                    className="outline-none w-full py-2 px-3 rounded border border-gray-300"
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={s.stock}
                                    onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                                    className="outline-none w-full py-2 px-3 rounded border border-gray-300"
                                />
                                <button type="button" onClick={() => removeSizeField(index)} className="p-2 text-red-500">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addSizeField} className="flex items-center gap-2 text-sm text-orange-600 font-medium mt-2">
                            <Plus className="w-4 h-4" /> Add another size
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <label className="text-base font-medium" htmlFor="stock-quantity">
                            Total Stock Quantity
                        </label>
                        <input
                            id="stock-quantity"
                            type="number"
                            placeholder="0"
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300"
                            onChange={(e) => setTotalStock(e.target.value)}
                            value={totalStock}
                            required
                        />
                    </div>
                )}
            </div>

            <button type="submit" className="px-8 py-2.5 bg-orange-600 text-white font-medium rounded">
                {isAdmin ? 'Add & Approve Product' : 'Submit for Approval'}
            </button>
        </form>
    );
}

const BulkUpload = () => {
    const { addBulkProducts, currency } = useAppContext();
    const [csvFile, setCsvFile] = useState(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parsedProducts, setParsedProducts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDownloadTemplate = () => {
        const csvHeader = "name,description,brand,color,category,price,offerPrice,stock,sizes,deliveryInfo,flashSalePrice,flashSaleEndDate,image_url_1,image_url_2,image_url_3,image_url_4\n";
        const csvExample = "Example Laptop,Powerful machine for all your needs,ExampleBrand,Space Gray,Laptop,1200,1000,50,,1-2 business days,,,'https://i.imgur.com/gB343so.png',,,\n";
        const csvContent = csvHeader + csvExample;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "product_template.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleFileChangeAndParse = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'text/csv') {
            toast.error("Please upload a valid .csv file.");
            return;
        }

        setCsvFile(file);
        setIsParsing(true);
        setParsedProducts([]);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setIsParsing(false);
                if (results.errors.length > 0) {
                    const firstError = results.errors[0];
                    let errorMessage = `Error on line ${firstError.row + 2}: ${firstError.message}.`;
                    if (firstError.code === 'TooFewFields' || firstError.code === 'TooManyFields') {
                        errorMessage += " Please ensure this row has the same number of columns as the header row, even if some cells are empty.";
                    }
                    toast.error(errorMessage, { duration: 8000 });
                    setCsvFile(null); // Reset
                    return;
                }

                if (results.data.length === 0) {
                    toast.error("CSV file is empty or contains no data rows.");
                    setCsvFile(null); // Reset
                    return;
                }

                const products = results.data.map((p, index) => ({ ...p, _previewId: index }));
                setParsedProducts(products);
                toast.success(`${products.length} products loaded for preview.`);
            },
            error: (err) => {
                setIsParsing(false);
                toast.error(`Parsing error: ${err.message}`);
                setCsvFile(null); // Reset
            }
        });
    };

    const handleSubmit = async () => {
        if (parsedProducts.length === 0) {
            toast.error("No products to submit.");
            return;
        }
        setIsSubmitting(true);
        await addBulkProducts(parsedProducts);
        setIsSubmitting(false);
        setParsedProducts([]);
        setCsvFile(null);
        // Reset file input
        const input = document.getElementById('csv-upload');
        if (input) input.value = '';
    };

    const handleClear = () => {
        setParsedProducts([]);
        setCsvFile(null);
        const input = document.getElementById('csv-upload');
        if (input) input.value = '';
    };

    if (parsedProducts.length > 0) {
        return (
            <div className="w-full space-y-6">
                <h3 className="text-lg font-semibold">Product Preview <span className="font-normal text-gray-500">({parsedProducts.length} items from {csvFile.name})</span></h3>
                <div className="overflow-x-auto rounded-md bg-white border border-gray-200 shadow-sm max-h-[50vh]">
                    <table className="min-w-full table-auto text-sm">
                        <thead className="text-gray-700 bg-gray-100 text-left sticky top-0">
                            <tr>
                                <th className="px-4 py-3 font-medium">Image</th>
                                <th className="px-4 py-3 font-medium">Product Details</th>
                                <th className="px-4 py-3 font-medium">Pricing</th>
                                <th className="px-4 py-3 font-medium">Inventory</th>
                                <th className="px-4 py-3 font-medium">Flash Sale</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 divide-y divide-gray-200">
                            {parsedProducts.map(product => (
                                <tr key={product._previewId} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                        {product.image_url_1 ?
                                            <Image src={product.image_url_1} alt={product.name} width={40} height={40} className="w-10 h-10 object-contain rounded bg-gray-100" />
                                            : <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">No img</div>
                                        }
                                    </td>
                                    <td className="px-4 py-2">
                                        <p className="font-medium text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.category}</p>
                                        <p className="text-xs text-gray-500">Brand: {product.brand || 'N/A'}</p>
                                        <p className="text-xs text-gray-500">Color: {product.color || 'N/A'}</p>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-gray-800">{currency}{product.offerPrice}</span>
                                            {product.price && <span className="text-xs text-gray-400 line-through">{currency}{product.price}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 truncate max-w-xs">{product.sizes || product.stock}</td>
                                    <td className="px-4 py-2">
                                        {product.flashSalePrice ? (
                                            <div>
                                                <p className="text-green-600 font-semibold">{currency}{product.flashSalePrice}</p>
                                                <p className="text-xs text-gray-500">Ends: {product.flashSaleEndDate}</p>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Not set</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button onClick={handleClear} disabled={isSubmitting} className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 disabled:bg-orange-300">
                        {isSubmitting ? 'Submitting...' : `Submit ${parsedProducts.length} Products`}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div className="p-6 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Download the CSV template file.</li>
                    <li>Fill in the product details. Do not change the column headers.</li>
                    <li>For images, provide direct public URLs (e.g., from Imgur, Cloudinary). At least one is required.</li>
                    <li>{'For products with different sizes, use the `sizes` column. Format it as a JSON string like `{"S": 10, "M": 20}`. Leave the `stock` column empty if you use `sizes`.'}</li>
                    <li>Upload the completed CSV file. The system will process it and submit the products for approval.</li>
                </ol>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <button onClick={handleDownloadTemplate} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700">
                    <Download className="w-4 h-4" />
                    Download Template
                </button>
                <div className="flex-grow w-full">
                    <label htmlFor="csv-upload" className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-100">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium text-gray-700">{csvFile ? csvFile.name : 'Select or Drop CSV File'}</span>
                    </label>
                    <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChangeAndParse} />
                </div>
            </div>
            {isParsing && (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-orange-500 border-gray-200"></div>
                    <span>Parsing file...</span>
                </div>
            )}
        </div>
    );
};


const AddProduct = () => {
    const [activeTab, setActiveTab] = useState('single');

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            <div className="md:p-10 p-4">
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('single')}
                            className={`${activeTab === 'single' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Single Upload
                        </button>
                        <button
                             onClick={() => setActiveTab('bulk')}
                             className={`${activeTab === 'bulk' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Bulk Upload
                        </button>
                    </nav>
                </div>
                {activeTab === 'single' ? <SingleProductUpload /> : <BulkUpload />}
            </div>
        </div>
    );
};

export default AddProduct;
