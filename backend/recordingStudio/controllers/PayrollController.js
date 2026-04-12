// backend/recordingStudio/controllers/PayrollController.js

export const getPayrollStatus = async (req, res) => {
    try {
      return res.json({
        success: true,
        message: "Payroll system active",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: "Payroll controller error",
        details: err.message,
      });
    }
  };
  
  export const submitPayroll = async (req, res) => {
    try {
      const { employeeName, hoursWorked, rate } = req.body;
  
      if (!employeeName || !hoursWorked || !rate) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }
  
      const totalPay = Number(hoursWorked) * Number(rate);
  
      return res.json({
        success: true,
        employeeName,
        hoursWorked,
        rate,
        totalPay,
        message: "Payroll processed successfully",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: "Payroll processing failed",
        details: err.message,
      });
    }
  };
  