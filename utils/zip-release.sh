git add -A
git commit -am "zipped on `date` "
git archive --prefix=solpress-payment-gateway/ -o release/release.zip HEAD
