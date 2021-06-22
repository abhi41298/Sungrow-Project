const bcrypt = require('bcryptjs')
bcryption = (req,res,admin)=>{
    bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(admin.password, salt, (err, hash) =>{
            if (err) throw err;
            admin.password = hash;
            admin.save().then(user => {
                req.flash('success_msg', "Successfully Registered Please Login")
                res.redirect("/admin")

            })
            .catch((e) => {
                console.log(e)
                req.flash('error_msg', "Opps Something Went Wrong")
                res.redirect('/admin/adminSignup')
            })
    })
})}
module.exports = bcryption