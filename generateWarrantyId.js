const Products = require('./models/products')
const generateWarrantyId = async(req, productSerialNumber, isAutomatic) => {
    var warrantyId = "SG";
    var val = await Products.findOne({ serial_no: productSerialNumber })
    if (val.type) {
        warrantyId = warrantyId + "/" + val.type + "/" + productSerialNumber[0] + "/"
        if (isAutomatic) {
            warrantyId = warrantyId + "AT/" + new Date().getTime();
            return warrantyId
        } else {
            warrantyId = warrantyId + "MU/" + req.user.notation + "/" + new Date().getTime()
            return warrantyId
        }
    } else {
        res.status(400)
        res.redirect('/error')
    }
}
module.exports = generateWarrantyId